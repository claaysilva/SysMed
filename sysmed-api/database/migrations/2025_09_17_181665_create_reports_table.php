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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type'); // medical, financial, statistical, custom
            $table->string('category'); // appointments, patients, revenue, diagnoses, etc
            $table->json('filters')->nullable(); // filtros aplicados
            $table->json('data')->nullable(); // dados calculados do relatório
            $table->text('description')->nullable();
            $table->enum('status', ['generating', 'completed', 'failed', 'scheduled'])->default('generating');
            $table->enum('format', ['pdf', 'excel', 'csv', 'html'])->default('pdf');
            $table->string('file_path')->nullable(); // caminho do arquivo gerado
            $table->integer('file_size')->nullable(); // tamanho em bytes
            $table->datetime('generated_at')->nullable();
            $table->datetime('expires_at')->nullable(); // quando o relatório expira
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // quem gerou
            $table->foreignId('template_id')->nullable()->constrained('report_templates')->onDelete('set null');
            $table->timestamps();

            $table->index(['type', 'category']);
            $table->index(['user_id', 'created_at']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
