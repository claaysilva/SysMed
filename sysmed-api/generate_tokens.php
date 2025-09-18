<?php

require_once 'vendor/autoload.php';

// Configurar o ambiente Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== GERADOR DE TOKENS PARA TODOS OS USUÁRIOS ===\n";

try {
  $users = App\Models\User::all();

  if ($users->isEmpty()) {
    echo "Nenhum usuário encontrado!\n";
    exit(1);
  }

  echo "Total de usuários: " . $users->count() . "\n\n";

  $tokens = [];

  foreach ($users as $user) {
    echo "Usuário: " . $user->name . " (" . $user->email . ")\n";

    // Deletar tokens antigos do usuário
    $user->tokens()->delete();

    // Criar novo token
    $token = $user->createToken('api-token')->plainTextToken;

    echo "Token gerado: " . $token . "\n";
    echo "---\n";

    $tokens[$user->email] = [
      'user' => $user->name,
      'email' => $user->email,
      'token' => $token,
      'id' => $user->id
    ];
  }

  echo "\n=== RESUMO DOS TOKENS ===\n";
  foreach ($tokens as $email => $data) {
    echo "Email: " . $email . "\n";
    echo "Nome: " . $data['user'] . "\n";
    echo "Token: " . $data['token'] . "\n\n";
  }

  // Salvar tokens em arquivo JSON
  file_put_contents('tokens_usuarios.json', json_encode($tokens, JSON_PRETTY_PRINT));
  echo "Tokens salvos em 'tokens_usuarios.json'\n";

  echo "\n=== TESTE DO PRIMEIRO TOKEN ===\n";
  $firstUser = $users->first();
  $firstToken = $tokens[$firstUser->email]['token'];

  echo "Testando token do usuário: " . $firstUser->name . "\n";
  echo "Token: " . $firstToken . "\n";

  // Verificar se o token funciona
  $testUser = \Laravel\Sanctum\PersonalAccessToken::findToken($firstToken)?->tokenable;
  if ($testUser) {
    echo "✅ Token válido! Usuário autenticado: " . $testUser->name . "\n";
  } else {
    echo "❌ Token inválido!\n";
  }
} catch (Exception $e) {
  echo "Erro: " . $e->getMessage() . "\n";
  echo "Trace: " . $e->getTraceAsString() . "\n";
}
