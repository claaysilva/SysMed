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
        Schema::create('medical_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained()->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');

            // Informações do arquivo
            $table->string('file_name'); // Nome original do arquivo
            $table->string('file_path'); // Caminho no storage
            $table->string('file_type'); // MIME type
            $table->integer('file_size'); // Tamanho em bytes
            $table->string('file_extension');

            // Categorização
            $table->enum('category', [
                'exam_result',      // Resultado de exame
                'image',            // Imagem médica
                'report',           // Relatório
                'prescription',     // Receita
                'referral',         // Encaminhamento
                'consent',          // Termo de consentimento
                'other'             // Outros
            ])->default('other');

            // Metadados
            $table->string('title')->nullable(); // Título do documento
            $table->text('description')->nullable(); // Descrição
            $table->date('document_date')->nullable(); // Data do documento (não upload)

            // Controle de acesso
            $table->enum('visibility', ['public', 'private', 'restricted'])->default('private');
            $table->json('allowed_users')->nullable(); // IDs dos usuários com acesso (para restricted)

            // Status
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();

            $table->timestamps();

            // Índices
            $table->index(['medical_record_id', 'category']);
            $table->index('file_type');
            $table->index('status');
            $table->index('uploaded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_attachments');
    }
};
