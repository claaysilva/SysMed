<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class DoctorController extends Controller
{
  public function index()
  {
    // Filtra apenas usuários médicos (ex.: role = 'medico')
    $doctors = User::where('role', 'medico')->get(['id', 'name']);

    return response()->json([
      'success' => true,
      'data' => $doctors,
    ]);
  }
}
