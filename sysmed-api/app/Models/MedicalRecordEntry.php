<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalRecordEntry extends Model
{
  use HasFactory;

  protected $fillable = [
    'patient_id',
    'user_id',
    'appointment_id',
    'conteudo',
  ];

  public function patient(): BelongsTo
  {
    return $this->belongsTo(Patient::class);
  }

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }
}
