<?php

require_once 'vendor/autoload.php';

// Configurar o ambiente Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

echo "=== VERIFICAÇÃO E CONFIGURAÇÃO DE SENHAS ===\n";

try {
  $users = App\Models\User::all();

  foreach ($users as $user) {
    echo "\nUsuário: " . $user->name . " (" . $user->email . ")\n";
    echo "Tem senha: " . (!empty($user->password) ? "SIM" : "NÃO") . "\n";

    if (empty($user->password)) {
      // Definir senha padrão: 123456
      $user->password = Hash::make('123456');
      $user->save();
      echo "✅ Senha definida como: 123456\n";
    } else {
      echo "ℹ️ Senha já existe\n";
    }
  }

  echo "\n=== TESTE DE LOGIN ===\n";

  // Testar login com primeiro usuário
  $firstUser = $users->first();
  echo "Testando login: " . $firstUser->email . " / 123456\n";

  $credentials = [
    'email' => $firstUser->email,
    'password' => '123456'
  ];

  if (Auth::attempt($credentials)) {
    $user = Auth::user();
    $token = $user->createToken('test-token')->plainTextToken;
    echo "✅ Login funcionando! Token: " . $token . "\n";
  } else {
    echo "❌ Login falhou!\n";
  }

  echo "\n=== SENHAS PARA TODOS OS USUÁRIOS ===\n";
  foreach ($users as $user) {
    echo $user->email . " -> senha: 123456\n";
  }
} catch (Exception $e) {
  echo "Erro: " . $e->getMessage() . "\n";
  echo "Trace: " . $e->getTraceAsString() . "\n";
}
