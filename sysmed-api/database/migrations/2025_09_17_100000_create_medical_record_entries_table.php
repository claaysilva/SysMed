<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('medical_record_entries', function (Blueprint $table) {
      $table->id();
      $table->foreignId('patient_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
      $table->longText('conteudo');
      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('medical_record_entries');
  }
};
