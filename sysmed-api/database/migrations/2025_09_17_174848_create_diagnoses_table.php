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
        Schema::create('diagnoses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained()->onDelete('cascade');

            // Dados do diagnóstico
            $table->string('code_icd10')->nullable(); // Código CID-10
            $table->string('description'); // Descrição do diagnóstico
            $table->text('details')->nullable(); // Detalhes adicionais

            // Tipo e classificação
            $table->enum('type', ['primary', 'secondary', 'differential'])->default('primary');
            $table->enum('status', ['active', 'resolved', 'chronic', 'suspected'])->default('active');

            // Datas importantes
            $table->date('diagnosed_at');
            $table->date('resolved_at')->nullable();

            // Gravidade e prognóstico
            $table->enum('severity', ['mild', 'moderate', 'severe'])->nullable();
            $table->text('prognosis')->nullable();

            $table->timestamps();

            // Índices
            $table->index(['medical_record_id', 'type']);
            $table->index('code_icd10');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnoses');
    }
};
