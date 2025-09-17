<?php

namespace Database\Seeders;

use App\Models\ReportTemplate;
use Illuminate\Database\Seeder;

class ReportTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = ReportTemplate::getSystemTemplates();

        foreach ($templates as $template) {
            ReportTemplate::updateOrCreate(
                [
                    'name' => $template['name'],
                    'type' => $template['type'],
                    'category' => $template['category'],
                ],
                $template
            );
        }
    }
}
