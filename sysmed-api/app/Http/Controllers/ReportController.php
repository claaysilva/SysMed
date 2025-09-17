<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReportRequest;
use App\Models\Report;
use App\Models\ReportTemplate;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\Diagnosis;
use App\Models\Prescription;
use App\Services\PdfReportService;
use App\Exports\ReportExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::with(['user', 'template'])
            ->where('user_id', Auth::id());

        // Filtros
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $reports = $query->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reports,
        ]);
    }

    public function store(StoreReportRequest $request)
    {
        $report = Report::create([
            'title' => $request->title,
            'type' => $request->type,
            'category' => $request->category,
            'description' => $request->description,
            'format' => $request->format,
            'filters' => $request->filters ?? [],
            'template_id' => $request->template_id,
            'user_id' => Auth::id(),
            'status' => 'generating',
            'expires_at' => $request->expires_at,
        ]);

        // Processar geração do relatório em background
        $this->generateReport($report);

        return response()->json([
            'success' => true,
            'data' => $report->load(['user', 'template']),
            'message' => 'Relatório iniciado com sucesso. Você será notificado quando estiver pronto.',
        ], 201);
    }

    public function show(Report $report)
    {
        // Verificar se o usuário tem acesso ao relatório
        if ($report->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado ao relatório.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $report->load(['user', 'template']),
        ]);
    }

    public function download(Report $report)
    {
        // Verificar acesso
        if ($report->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado ao relatório.',
            ], 403);
        }

        // Verificar se está pronto para download
        if (!$report->is_downloadable) {
            return response()->json([
                'success' => false,
                'message' => 'Relatório não está disponível para download.',
            ], 404);
        }

        $filePath = storage_path('app/' . $report->file_path);
        $fileName = $report->title . '.' . $report->format;

        return response()->download($filePath, $fileName);
    }

    public function destroy(Report $report)
    {
        // Verificar acesso
        if ($report->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado ao relatório.',
            ], 403);
        }

        // Deletar arquivo se existir
        $report->deleteFile();
        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'Relatório excluído com sucesso.',
        ]);
    }

    public function templates()
    {
        $templates = ReportTemplate::active()
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $templates,
        ]);
    }

    public function statistics()
    {
        $userId = Auth::id();

        $stats = [
            'total_reports' => Report::where('user_id', $userId)->count(),
            'completed_reports' => Report::where('user_id', $userId)->completed()->count(),
            'generating_reports' => Report::where('user_id', $userId)->where('status', 'generating')->count(),
            'failed_reports' => Report::where('user_id', $userId)->where('status', 'failed')->count(),
            'reports_this_month' => Report::where('user_id', $userId)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'storage_used' => Report::where('user_id', $userId)->sum('file_size'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Exportar relatório em tempo real (sem salvar)
     */
    public function export(Request $request)
    {
        $request->validate([
            'template_id' => 'required|exists:report_templates,id',
            'format' => 'required|in:pdf,excel,csv',
            'filters' => 'array',
        ]);

        $template = ReportTemplate::findOrFail($request->template_id);
        $filters = $request->filters ?? [];

        // Buscar dados
        $data = $this->fetchDataByCategory($template->category, $filters);

        $fileName = $template->name . '_' . now()->format('Y-m-d_H-i-s');

        switch ($request->format) {
            case 'pdf':
                return $this->exportPdf($data, $template, $filters, $fileName);
            case 'excel':
                return $this->exportExcel($data, $template, $filters, $fileName);
            case 'csv':
                return $this->exportCsv($data, $template, $filters, $fileName);
        }
    }

    private function exportPdf(array $data, ReportTemplate $template, array $filters, string $fileName)
    {
        $pdfService = new PdfReportService();

        $pdfContent = match ($template->category) {
            'appointments' => $pdfService->generateConsultationReport($data['records'] ?? [], $filters),
            'patients' => $pdfService->generatePatientReport($data['patients'] ?? [], $filters),
            'diagnoses' => $pdfService->generateDiagnosisReport($data['detailed_stats'] ?? [], $filters),
            'revenue' => $pdfService->generateFinancialReport($data['monthly_breakdown'] ?? [], $filters),
            default => $pdfService->generateFromData($data, $template->name)
        };

        return response($pdfContent)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $fileName . '.pdf"');
    }

    private function exportExcel(array $data, ReportTemplate $template, array $filters, string $fileName)
    {
        $exportData = $this->prepareDataForExportByCategory($data, $template->category);
        $headers = $this->getExportHeaders($template->category);

        $export = new ReportExport($exportData, $template->name, $headers);

        return Excel::download($export, $fileName . '.xlsx');
    }

    private function exportCsv(array $data, ReportTemplate $template, array $filters, string $fileName)
    {
        $exportData = $this->prepareDataForExportByCategory($data, $template->category);
        $headers = $this->getExportHeaders($template->category);

        $export = new ReportExport($exportData, $template->name, $headers);

        return Excel::download($export, $fileName . '.csv', \Maatwebsite\Excel\Excel::CSV);
    }

    private function fetchDataByCategory(string $category, array $filters): array
    {
        switch ($category) {
            case 'appointments':
                return $this->getAppointmentsData($filters);
            case 'patients':
                return $this->getPatientsData($filters);
            case 'diagnoses':
                return $this->getDiagnosesData($filters);
            case 'prescriptions':
                return $this->getPrescriptionsData($filters);
            case 'revenue':
                return $this->getRevenueData($filters);
            default:
                return [];
        }
    }

    private function prepareDataForExportByCategory(array $data, string $category): array
    {
        switch ($category) {
            case 'appointments':
                return collect($data['records'] ?? [])->map(function ($record) {
                    return [
                        'id' => $record['id'],
                        'patient_name' => $record['patient_name'],
                        'patient_cpf' => $record['patient_cpf'],
                        'doctor_name' => $record['doctor_name'],
                        'consultation_date' => $record['consultation_date'],
                        'consultation_time' => $record['consultation_time'],
                        'consultation_type' => $record['consultation_type'],
                        'status' => $record['status'],
                        'chief_complaint' => $record['chief_complaint'],
                        'diagnosis_count' => $record['diagnosis_count'],
                        'prescription_count' => $record['prescription_count'],
                    ];
                })->toArray();

            case 'patients':
                return collect($data['patients'] ?? [])->map(function ($patient) {
                    return [
                        'id' => $patient['id'],
                        'nome_completo' => $patient['nome_completo'],
                        'cpf' => $patient['cpf'],
                        'data_nascimento' => $patient['data_nascimento'],
                        'telefone' => $patient['telefone'],
                        'email' => $patient['email'],
                        'total_consultations' => $patient['total_consultations'],
                        'last_consultation' => $patient['last_consultation'],
                        'created_at' => $patient['created_at'],
                    ];
                })->toArray();

            case 'diagnoses':
                return collect($data['detailed_stats'] ?? [])->map(function ($stat) {
                    return [
                        'code' => $stat['code'],
                        'description' => $stat['description'],
                        'frequency' => $stat['frequency'],
                        'percentage' => $stat['percentage'] . '%',
                    ];
                })->toArray();

            case 'prescriptions':
                return collect($data['prescriptions'] ?? [])->map(function ($prescription) {
                    return [
                        'id' => $prescription['id'],
                        'patient_name' => $prescription['patient_name'],
                        'medication' => $prescription['medication'],
                        'dosage' => $prescription['dosage'],
                        'frequency' => $prescription['frequency'],
                        'duration' => $prescription['duration'],
                        'instructions' => $prescription['instructions'],
                        'prescribed_at' => $prescription['prescribed_at'],
                    ];
                })->toArray();

            case 'revenue':
                return collect($data['monthly_breakdown'] ?? [])->map(function ($breakdown) {
                    return [
                        'month' => $breakdown['month'],
                        'revenue' => 'R$ ' . number_format($breakdown['revenue'], 2, ',', '.'),
                        'expenses' => 'R$ ' . number_format($breakdown['expenses'], 2, ',', '.'),
                        'profit' => 'R$ ' . number_format($breakdown['profit'], 2, ',', '.'),
                        'consultations' => $breakdown['consultations'],
                    ];
                })->toArray();

            default:
                return $data;
        }
    }

    private function generateReport(Report $report)
    {
        try {
            // Buscar dados baseado no tipo e filtros
            $data = $this->fetchReportData($report);

            // Gerar arquivo baseado no formato
            $filePath = $this->generateReportFile($report, $data);

            // Marcar como concluído
            $report->markAsCompleted($filePath, filesize(storage_path('app/' . $filePath)));
        } catch (\Exception $e) {
            Log::error('Erro ao gerar relatório: ' . $e->getMessage());
            $report->markAsFailed();
        }
    }

    private function fetchReportData(Report $report): array
    {
        $filters = $report->filters ?? [];

        switch ($report->category) {
            case 'appointments':
                return $this->getAppointmentsData($filters);
            case 'patients':
                return $this->getPatientsData($filters);
            case 'diagnoses':
                return $this->getDiagnosesData($filters);
            case 'prescriptions':
                return $this->getPrescriptionsData($filters);
            case 'revenue':
                return $this->getRevenueData($filters);
            default:
                return [];
        }
    }

    private function getPrescriptionsData(array $filters): array
    {
        $query = Prescription::with(['medicalRecord.patient'])
            ->when(isset($filters['date_from']), fn($q) => $q->whereHas('medicalRecord', fn($mr) => $mr->where('consultation_date', '>=', $filters['date_from'])))
            ->when(isset($filters['date_to']), fn($q) => $q->whereHas('medicalRecord', fn($mr) => $mr->where('consultation_date', '<=', $filters['date_to'])));

        $prescriptions = $query->get();

        return [
            'summary' => [
                'total_prescriptions' => $prescriptions->count(),
                'unique_medications' => $prescriptions->pluck('medication')->unique()->count(),
                'most_prescribed' => $prescriptions->groupBy('medication')->map(fn($group) => $group->count())->sortDesc()->take(10),
            ],
            'prescriptions' => $prescriptions->map(function ($prescription) {
                return [
                    'id' => $prescription->id,
                    'patient_name' => $prescription->medicalRecord->patient->nome_completo,
                    'medication' => $prescription->medication,
                    'dosage' => $prescription->dosage,
                    'frequency' => $prescription->frequency,
                    'duration' => $prescription->duration,
                    'instructions' => $prescription->instructions,
                    'prescribed_at' => $prescription->medicalRecord->consultation_date,
                ];
            }),
        ];
    }

    private function getRevenueData(array $filters): array
    {
        // Simulação de dados de receita - integrar com sistema de pagamentos
        $data = [
            'summary' => [
                'total_revenue' => 45000.00,
                'total_expenses' => 12000.00,
                'net_profit' => 33000.00,
                'total_consultations' => 150,
                'average_consultation_value' => 300.00,
            ],
            'monthly_breakdown' => [
                [
                    'month' => 'Setembro 2025',
                    'revenue' => 15000.00,
                    'expenses' => 4000.00,
                    'profit' => 11000.00,
                    'consultations' => 50,
                ],
                [
                    'month' => 'Agosto 2025',
                    'revenue' => 18000.00,
                    'expenses' => 5000.00,
                    'profit' => 13000.00,
                    'consultations' => 60,
                ],
                [
                    'month' => 'Julho 2025',
                    'revenue' => 12000.00,
                    'expenses' => 3000.00,
                    'profit' => 9000.00,
                    'consultations' => 40,
                ],
            ],
        ];

        return $data;
    }

    private function getAppointmentsData(array $filters): array
    {
        $query = MedicalRecord::with(['patient', 'doctor'])
            ->when(isset($filters['date_from']), fn($q) => $q->where('consultation_date', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn($q) => $q->where('consultation_date', '<=', $filters['date_to']))
            ->when(isset($filters['doctor_id']), fn($q) => $q->whereHas('doctor', fn($dq) => $dq->where('id', $filters['doctor_id'])))
            ->when(isset($filters['consultation_type']), fn($q) => $q->where('consultation_type', $filters['consultation_type']));

        $records = $query->get();

        return [
            'summary' => [
                'total_appointments' => $records->count(),
                'by_type' => $records->groupBy('consultation_type')->map(fn($group) => $group->count()),
                'by_status' => $records->groupBy('status')->map(fn($group) => $group->count()),
                'period' => [
                    'from' => $filters['date_from'] ?? null,
                    'to' => $filters['date_to'] ?? null,
                ],
            ],
            'records' => $records->map(function ($record) {
                return [
                    'id' => $record->id,
                    'patient_name' => $record->patient->nome_completo,
                    'patient_cpf' => $record->patient->cpf,
                    'doctor_name' => $record->doctor->name ?? 'N/A',
                    'consultation_date' => $record->consultation_date,
                    'consultation_time' => $record->consultation_time,
                    'consultation_type' => $record->consultation_type,
                    'status' => $record->status,
                    'chief_complaint' => $record->chief_complaint,
                    'diagnosis_count' => $record->diagnoses->count(),
                    'prescription_count' => $record->prescriptions->count(),
                    'created_at' => $record->created_at,
                ];
            }),
        ];
    }

    private function getPatientsData(array $filters): array
    {
        $query = Patient::withCount(['medicalRecords', 'appointments'])
            ->when(isset($filters['registration_from']), fn($q) => $q->where('created_at', '>=', $filters['registration_from']))
            ->when(isset($filters['registration_to']), fn($q) => $q->where('created_at', '<=', $filters['registration_to']))
            ->when(isset($filters['active_only']) && $filters['active_only'], fn($q) => $q->whereHas('medicalRecords'));

        $patients = $query->get();

        return [
            'summary' => [
                'total_patients' => $patients->count(),
                'active_patients' => $patients->where('medical_records_count', '>', 0)->count(),
                'new_this_month' => $patients->where('created_at', '>=', now()->startOfMonth())->count(),
                'age_distribution' => $this->calculateAgeDistribution($patients),
            ],
            'patients' => $patients->map(function ($patient) {
                return [
                    'id' => $patient->id,
                    'nome_completo' => $patient->nome_completo,
                    'cpf' => $patient->cpf,
                    'data_nascimento' => $patient->data_nascimento,
                    'telefone' => $patient->telefone,
                    'email' => $patient->email,
                    'total_consultations' => $patient->medical_records_count,
                    'last_consultation' => $patient->medicalRecords()->latest()->first()?->consultation_date,
                    'created_at' => $patient->created_at,
                ];
            }),
        ];
    }

    private function getDiagnosesData(array $filters): array
    {
        $query = Diagnosis::with(['medicalRecord.patient'])
            ->when(isset($filters['date_from']), fn($q) => $q->whereHas('medicalRecord', fn($mr) => $mr->where('consultation_date', '>=', $filters['date_from'])))
            ->when(isset($filters['date_to']), fn($q) => $q->whereHas('medicalRecord', fn($mr) => $mr->where('consultation_date', '<=', $filters['date_to'])));

        $diagnoses = $query->get();

        $totalDiagnoses = $diagnoses->count();

        $stats = $diagnoses->groupBy('code_icd10')
            ->map(function ($group) use ($totalDiagnoses) {
                $first = $group->first();
                return [
                    'code' => $first->code_icd10,
                    'description' => $first->description,
                    'frequency' => $group->count(),
                    'percentage' => round(($group->count() / max($totalDiagnoses, 1)) * 100, 2),
                ];
            })
            ->sortByDesc('frequency')
            ->values();

        return [
            'summary' => [
                'total_diagnoses' => $diagnoses->count(),
                'unique_codes' => $diagnoses->pluck('code_icd10')->unique()->count(),
                'most_common' => $stats->take(10),
                'by_type' => $diagnoses->groupBy('type')->map(fn($group) => $group->count()),
            ],
            'detailed_stats' => $stats,
        ];
    }

    private function generateReportFile(Report $report, array $data): string
    {
        $fileName = 'reports/' . $report->id . '_' . time() . '.' . $report->format;

        switch ($report->format) {
            case 'pdf':
                return $this->generatePDF($fileName, $report, $data);
            case 'excel':
                return $this->generateExcel($fileName, $report, $data);
            case 'csv':
                return $this->generateCSV($fileName, $report, $data);
            case 'html':
                return $this->generateHTML($fileName, $report, $data);
            default:
                throw new \Exception('Formato não suportado: ' . $report->format);
        }
    }

    private function generatePDF(string $fileName, Report $report, array $data): string
    {
        $pdfService = new PdfReportService();

        $pdfContent = match ($report->category) {
            'appointments' => $pdfService->generateConsultationReport($data['records'] ?? [], $report->filters ?? []),
            'patients' => $pdfService->generatePatientReport($data['patients'] ?? [], $report->filters ?? []),
            'diagnoses' => $pdfService->generateDiagnosisReport($data['detailed_stats'] ?? [], $report->filters ?? []),
            'revenue' => $pdfService->generateFinancialReport($data['monthly_breakdown'] ?? [], $report->filters ?? []),
            default => $pdfService->generateFromData($data, $report->title)
        };

        Storage::put($fileName, $pdfContent);
        return $fileName;
    }

    private function generateExcel(string $fileName, Report $report, array $data): string
    {
        $exportData = $this->prepareDataForExport($data, $report);
        $headers = $this->getExportHeaders($report->category);

        $export = new ReportExport($exportData, $report->title, $headers);
        Excel::store($export, $fileName);

        return $fileName;
    }

    private function generateCSV(string $fileName, Report $report, array $data): string
    {
        $csv = $this->generateCSVContent($report, $data);
        Storage::put($fileName, $csv);

        return $fileName;
    }

    private function generateHTML(string $fileName, Report $report, array $data): string
    {
        $html = $this->generateHTMLContent($report, $data);
        Storage::put($fileName, $html);

        return $fileName;
    }

    private function generateHTMLContent(Report $report, array $data): string
    {
        $html = "<html><head><title>{$report->title}</title>";
        $html .= "<style>body{font-family:Arial,sans-serif;margin:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#f2f2f2;}</style>";
        $html .= "</head><body>";
        $html .= "<h1>{$report->title}</h1>";
        $html .= "<p>Gerado em: " . now()->format('d/m/Y H:i:s') . "</p>";

        if (isset($data['summary'])) {
            $html .= "<h2>Resumo</h2>";
            $html .= "<ul>";
            foreach ($data['summary'] as $key => $value) {
                if (is_array($value)) continue;
                $html .= "<li><strong>" . ucfirst(str_replace('_', ' ', $key)) . ":</strong> {$value}</li>";
            }
            $html .= "</ul>";
        }

        $html .= "</body></html>";

        return $html;
    }

    private function generateCSVContent(Report $report, array $data): string
    {
        // Implementação básica de CSV
        $csv = "Relatório: {$report->title}\n";
        $csv .= "Gerado em: " . now()->format('d/m/Y H:i:s') . "\n\n";

        return $csv;
    }

    private function calculateAgeDistribution($patients): array
    {
        $ages = $patients->map(function ($patient) {
            return Carbon::parse($patient->data_nascimento)->age;
        });

        return [
            '0-18' => $ages->filter(fn($age) => $age <= 18)->count(),
            '19-30' => $ages->filter(fn($age) => $age >= 19 && $age <= 30)->count(),
            '31-50' => $ages->filter(fn($age) => $age >= 31 && $age <= 50)->count(),
            '51-70' => $ages->filter(fn($age) => $age >= 51 && $age <= 70)->count(),
            '71+' => $ages->filter(fn($age) => $age > 70)->count(),
        ];
    }

    private function prepareDataForExport(array $data, Report $report): array
    {
        switch ($report->category) {
            case 'appointments':
                return $data['records'] ?? [];
            case 'patients':
                return $data['patients'] ?? [];
            case 'diagnoses':
                return $data['detailed_stats'] ?? [];
            case 'prescriptions':
                return $data['prescriptions'] ?? [];
            case 'revenue':
                return $data['monthly_breakdown'] ?? [];
            default:
                return $data;
        }
    }

    private function getExportHeaders(string $category): array
    {
        return match ($category) {
            'appointments' => [
                'ID',
                'Paciente',
                'CPF',
                'Médico',
                'Data Consulta',
                'Horário',
                'Tipo',
                'Status',
                'Queixa Principal',
                'Diagnósticos',
                'Prescrições'
            ],
            'patients' => [
                'ID',
                'Nome Completo',
                'CPF',
                'Data Nascimento',
                'Telefone',
                'Email',
                'Total Consultas',
                'Última Consulta',
                'Data Cadastro'
            ],
            'diagnoses' => [
                'Código CID',
                'Descrição',
                'Frequência',
                'Percentual'
            ],
            'prescriptions' => [
                'ID',
                'Paciente',
                'Medicação',
                'Dosagem',
                'Frequência',
                'Duração',
                'Instruções',
                'Data Prescrição'
            ],
            'revenue' => [
                'Período',
                'Receita',
                'Despesas',
                'Lucro',
                'Consultas'
            ],
            default => ['Dados']
        };
    }
}
