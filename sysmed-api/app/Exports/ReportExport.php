<?php

namespace App\Exports;

use App\Models\Report;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
  protected $data;
  protected $title;
  protected $headers;

  public function __construct($data, $title = 'Relatório', $headers = [])
  {
    $this->data = collect($data);
    $this->title = $title;
    $this->headers = $headers;
  }

  /**
   * @return \Illuminate\Support\Collection
   */
  public function collection()
  {
    return $this->data;
  }

  /**
   * Cabeçalhos das colunas
   */
  public function headings(): array
  {
    if (!empty($this->headers)) {
      return $this->headers;
    }

    // Headers padrão baseados no primeiro item dos dados
    if ($this->data->isNotEmpty()) {
      $first = $this->data->first();
      if (is_array($first) || is_object($first)) {
        return array_keys((array)$first);
      }
    }

    return ['Dados'];
  }

  /**
   * Mapear dados para cada linha
   */
  public function map($row): array
  {
    if (is_array($row) || is_object($row)) {
      return array_values((array)$row);
    }

    return [$row];
  }

  /**
   * Aplicar estilos à planilha
   */
  public function styles(Worksheet $sheet)
  {
    // Estilo do cabeçalho
    $sheet->getStyle('1:1')->applyFromArray([
      'font' => [
        'bold' => true,
        'color' => ['rgb' => 'FFFFFF'],
        'size' => 12,
      ],
      'fill' => [
        'fillType' => Fill::FILL_SOLID,
        'startColor' => ['rgb' => '3B82F6'],
      ],
      'alignment' => [
        'horizontal' => Alignment::HORIZONTAL_CENTER,
        'vertical' => Alignment::VERTICAL_CENTER,
      ],
    ]);

    // Estilo das linhas de dados
    $lastRow = $this->data->count() + 1;
    $sheet->getStyle("A2:Z{$lastRow}")->applyFromArray([
      'alignment' => [
        'horizontal' => Alignment::HORIZONTAL_LEFT,
        'vertical' => Alignment::VERTICAL_CENTER,
      ],
      'font' => [
        'size' => 10,
      ],
    ]);

    // Bordas para toda a tabela
    $lastColumn = chr(65 + count($this->headings()) - 1);
    $sheet->getStyle("A1:{$lastColumn}{$lastRow}")->applyFromArray([
      'borders' => [
        'allBorders' => [
          'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
          'color' => ['rgb' => 'D1D5DB'],
        ],
      ],
    ]);

    return $sheet;
  }

  /**
   * Título da aba
   */
  public function title(): string
  {
    return $this->title;
  }
}
