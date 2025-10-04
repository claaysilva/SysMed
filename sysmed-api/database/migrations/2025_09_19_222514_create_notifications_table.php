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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // email, sms, push, whatsapp
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // dados extras específicos do tipo

            // Destinatário
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('recipient_email')->nullable();
            $table->string('recipient_phone')->nullable();

            // Relacionamentos opcionais
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('medical_record_id')->nullable()->constrained()->onDelete('set null');

            // Controle de envio
            $table->enum('status', ['pending', 'sent', 'failed', 'cancelled'])->default('pending');
            $table->timestamp('scheduled_for')->nullable(); // para notificações agendadas
            $table->timestamp('sent_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->integer('retry_count')->default(0);
            $table->integer('max_retries')->default(3);

            // Template e prioridade
            $table->string('template')->nullable(); // nome do template usado
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->boolean('read')->default(false);

            $table->timestamps();

            // Índices para performance
            $table->index(['status', 'scheduled_for']);
            $table->index(['user_id', 'read']);
            $table->index(['patient_id', 'type']);
            $table->index(['type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
