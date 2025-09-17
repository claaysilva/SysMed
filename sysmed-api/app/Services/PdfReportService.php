<?php

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;

class PdfReportService
{
  protected $dompdf;

  public function __construct()
  {
    $options = new Options();
    $options->set('defaultFont', 'Arial');
    $options->set('isRemoteEnabled', true);
    $options->set('isHtml5ParserEnabled', true);

    $this->dompdf = new Dompdf($options);
  }

  /**
   * Gerar PDF a partir de dados estruturados
   */
  public function generateFromData($data, $title = 'Relatório', $headers = [], $template = 'default')
  {
    $html = $this->buildHtml($data, $title, $headers, $template);

    $this->dompdf->loadHtml($html);
    $this->dompdf->setPaper('A4', 'portrait');
    $this->dompdf->render();

    return $this->dompdf->output();
  }

  /**
   * Construir HTML para o relatório
   */
  protected function buildHtml($data, $title, $headers, $template)
  {
    $currentDate = now()->format('d/m/Y H:i');

    $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>{$title}</title>
            <style>
                {$this->getStyles($template)}
            </style>
        </head>
        <body>
            <div class='header'>
                <div class='logo'>
                    <h1>SysMed</h1>
                    <p class='subtitle'>Sistema Médico</p>
                </div>
                <div class='report-info'>
                    <h2>{$title}</h2>
                    <p>Gerado em: {$currentDate}</p>
                </div>
            </div>

            <div class='content'>
                {$this->buildTable($data,$headers)}
            </div>

            <div class='footer'>
                <p>SysMed - Sistema de Gestão Médica</p>
                <p>Página <span class='pagenum'></span></p>
            </div>
        </body>
        </html>";

    return $html;
  }

  /**
   * Construir tabela de dados
   */
  protected function buildTable($data, $headers)
  {
    if (empty($data)) {
      return '<p class="no-data">Nenhum dado encontrado para este relatório.</p>';
    }

    $html = '<table class="data-table">';

    // Cabeçalho da tabela
    if (!empty($headers)) {
      $html .= '<thead><tr>';
      foreach ($headers as $header) {
        $html .= "<th>" . htmlspecialchars($header) . "</th>";
      }
      $html .= '</tr></thead>';
    }

    // Dados da tabela
    $html .= '<tbody>';
    foreach ($data as $row) {
      $html .= '<tr>';

      if (is_array($row) || is_object($row)) {
        foreach ((array)$row as $value) {
          $html .= '<td>' . htmlspecialchars($value ?? '') . '</td>';
        }
      } else {
        $html .= '<td>' . htmlspecialchars($row) . '</td>';
      }

      $html .= '</tr>';
    }
    $html .= '</tbody></table>';

    return $html;
  }

  /**
   * Estilos CSS para diferentes templates
   */
  protected function getStyles($template)
  {
    $baseStyles = "
            @page {
                margin: 2cm 1.5cm;
                @bottom-center {
                    content: 'Página ' counter(page);
                }
            }
            
            body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
                margin: 0;
                padding: 0;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #3B82F6;
            }
            
            .logo h1 {
                color: #3B82F6;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
            }
            
            .logo .subtitle {
                color: #6B7280;
                margin: 0;
                font-size: 12px;
            }
            
            .report-info {
                text-align: right;
            }
            
            .report-info h2 {
                color: #111827;
                margin: 0 0 5px 0;
                font-size: 18px;
            }
            
            .report-info p {
                color: #6B7280;
                margin: 0;
                font-size: 11px;
            }
            
            .content {
                margin-bottom: 50px;
            }
            
            .data-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                font-size: 11px;
            }
            
            .data-table th {
                background-color: #3B82F6;
                color: white;
                padding: 10px 8px;
                text-align: left;
                font-weight: bold;
                border: 1px solid #ddd;
            }
            
            .data-table td {
                padding: 8px;
                border: 1px solid #ddd;
                vertical-align: top;
            }
            
            .data-table tbody tr:nth-child(even) {
                background-color: #F9FAFB;
            }
            
            .data-table tbody tr:hover {
                background-color: #F3F4F6;
            }
            
            .no-data {
                text-align: center;
                color: #6B7280;
                font-style: italic;
                margin: 40px 0;
            }
            
            .footer {
                position: fixed;
                bottom: 0;
                width: 100%;
                text-align: center;
                font-size: 10px;
                color: #6B7280;
                border-top: 1px solid #E5E7EB;
                padding-top: 10px;
            }
        ";

    return $baseStyles;
  }

  /**
   * Gerar PDF para relatório de consultas
   */
  public function generateConsultationReport($consultations, $filters = [])
  {
    $headers = [
      'Paciente',
      'Médico',
      'Data',
      'Tipo',
      'Status',
      'Observações'
    ];

    $data = collect($consultations)->map(function ($consultation) {
      return [
        'patient' => $consultation['patient_name'] ?? '',
        'doctor' => $consultation['doctor_name'] ?? '',
        'date' => $consultation['consultation_date'] ?? '',
        'type' => $consultation['consultation_type'] ?? '',
        'status' => $consultation['status'] ?? '',
        'notes' => $consultation['notes'] ?? ''
      ];
    });

    $title = 'Relatório de Consultas';
    if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
      $title .= " - {$filters['date_from']} a {$filters['date_to']}";
    }

    return $this->generateFromData($data, $title, $headers);
  }

  /**
   * Gerar PDF para relatório financeiro
   */
  public function generateFinancialReport($data, $filters = [])
  {
    $headers = [
      'Período',
      'Receita Total',
      'Despesas',
      'Lucro Líquido',
      'Consultas',
      'Procedimentos'
    ];

    $title = 'Relatório Financeiro';
    if (!empty($filters['month']) && !empty($filters['year'])) {
      $title .= " - {$filters['month']}/{$filters['year']}";
    }

    return $this->generateFromData($data, $title, $headers);
  }

  /**
   * Gerar PDF para estatísticas de diagnósticos
   */
  public function generateDiagnosisReport($diagnoses, $filters = [])
  {
    $headers = [
      'Código CID',
      'Diagnóstico',
      'Frequência',
      'Percentual',
      'Primeiro Caso',
      'Último Caso'
    ];

    $title = 'Estatísticas de Diagnósticos';

    return $this->generateFromData($diagnoses, $title, $headers);
  }

  /**
   * Gerar PDF para relatório de pacientes
   */
  public function generatePatientReport($patients, $filters = [])
  {
    $headers = [
      'Nome',
      'CPF',
      'Data Nascimento',
      'Idade',
      'Última Consulta',
      'Total Consultas',
      'Status'
    ];

    $title = 'Relatório de Pacientes';
    if (!empty($filters['active_only'])) {
      $title .= ' (Apenas Ativos)';
    }

    return $this->generateFromData($patients, $title, $headers);
  }
}
