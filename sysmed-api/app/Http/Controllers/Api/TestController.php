<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TestController extends Controller
{
  public function simpleTest()
  {
    try {
      return response()->json([
        'message' => 'Teste simples funcionando',
        'timestamp' => now(),
        'status' => 'success'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Erro no teste',
        'error' => $e->getMessage(),
        'timestamp' => now(),
        'status' => 'error'
      ], 500);
    }
  }

  public function dashboardTest()
  {
    try {
      return response()->json([
        'message' => 'Dashboard teste funcionando',
        'totalPatients' => 0,
        'totalAppointments' => 0,
        'totalRecords' => 0,
        'totalReports' => 0,
        'recentReports' => [],
        'timestamp' => now(),
        'status' => 'success'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Erro no dashboard teste',
        'error' => $e->getMessage(),
        'timestamp' => now(),
        'status' => 'error'
      ], 500);
    }
  }
}
