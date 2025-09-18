<?php

require_once 'vendor/autoload.php';

// Configurar o ambiente Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTE DIRETO DE TOKEN ===\n";

$token = "37|LzaxVrFoWlKaliKlwwqrjPgvydALdQFAX2xBR25n74b9ffc0";

try {
  // Verificar se o token existe
  $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

  if (!$personalAccessToken) {
    echo "❌ Token não encontrado!\n";
    exit(1);
  }

  $user = $personalAccessToken->tokenable;
  echo "✅ Token válido!\n";
  echo "Usuário: " . $user->name . "\n";
  echo "Email: " . $user->email . "\n";
  echo "ID: " . $user->id . "\n";

  // Simular chamada para dashboard
  echo "\n=== TESTE DO DASHBOARD ===\n";

  $request = new Illuminate\Http\Request();
  $request->setUserResolver(function () use ($user) {
    return $user;
  });

  $controller = new App\Http\Controllers\Api\DashboardController();
  $response = $controller->statistics($request);

  echo "Status: " . $response->getStatusCode() . "\n";
  echo "Resposta: " . substr($response->getContent(), 0, 200) . "...\n";
} catch (Exception $e) {
  echo "❌ Erro: " . $e->getMessage() . "\n";
}
