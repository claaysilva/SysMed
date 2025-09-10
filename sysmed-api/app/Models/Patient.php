<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    // Adicione esta propriedade
    protected $fillable = [
        'nome_completo',
        'data_nascimento',
        'cpf',
        'telefone',
        'endereco',
    ];
}
