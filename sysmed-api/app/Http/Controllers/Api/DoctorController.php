<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class DoctorController extends Controller
{
  public function index()
  {
    // Filtra apenas usuários médicos (exemplo: role = 'medico' ou tipo = 'medico')
    return User::where('role', 'medico')->get(['id', 'name']);
  }
}
