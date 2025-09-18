<?php

require_once 'vendor/autoload.php';

// Configurar o ambiente Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Testar diretamente o controller
try {
  echo "=== TESTE DIRETO DO DASHBOARD ===\n";

  // Buscar um usuário para autenticação
  $user = App\Models\User::first();
  if (!$user) {
    echo "Erro: Nenhum usuário encontrado!\n";
    exit(1);
  }

  echo "Usuário: " . $user->name . "\n";

  // Criar uma instância do controller
  $controller = new App\Http\Controllers\Api\DashboardController();

  // Criar um request mock
  $request = new Illuminate\Http\Request();
  $request->setUserResolver(function () use ($user) {
    return $user;
  });

  echo "Chamando controller...\n";
  $response = $controller->statistics($request);

  echo "Status: " . $response->getStatusCode() . "\n";
  echo "Resposta: " . $response->getContent() . "\n";
} catch (Exception $e) {
  echo "Erro: " . $e->getMessage() . "\n";
  echo "Trace: " . $e->getTraceAsString() . "\n";
}
