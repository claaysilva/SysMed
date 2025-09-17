<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('report_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // medical, financial, statistical
            $table->string('category');
            $table->text('description')->nullable();
            $table->json('fields'); // campos que o template usa
            $table->json('default_filters')->nullable(); // filtros padrão
            $table->text('query_template')->nullable(); // template da query SQL
            $table->text('html_template')->nullable(); // template HTML para PDF
            $table->json('chart_config')->nullable(); // configuração de gráficos
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false); // templates do sistema vs customizados
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['type', 'category']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_templates');
    }
};
