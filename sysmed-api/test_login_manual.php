<?php
echo "=== TESTE SIMPLES DE LOGIN ===\n\n";

// Vamos testar direto no banco primeiro
require_once __DIR__ . '/vendor/autoload.php';

// Boot da aplicação Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

echo "1. Verificando usuários no banco...\n";
$users = User::all();
echo "Total de usuários: " . $users->count() . "\n\n";

foreach ($users as $user) {
  echo "ID: {$user->id}\n";
  echo "Nome: {$user->name}\n";
  echo "Email: {$user->email}\n";
  echo "Senha Hash: " . substr($user->password, 0, 30) . "...\n";

  // Testar se a senha bate
  $senhaCorreta = Hash::check('senha123', $user->password);
  echo "Senha 'senha123' confere: " . ($senhaCorreta ? "✅ SIM" : "❌ NÃO") . "\n";

  echo "---\n";
}

echo "\n2. Testando criação de token...\n";
$user = User::where('email', 'admin@sysmed.com')->first();
if ($user) {
  echo "Usuário admin encontrado: {$user->name}\n";

  // Verificar se a senha confere
  if (Hash::check('senha123', $user->password)) {
    echo "✅ Senha confere!\n";

    // Criar token
    $token = $user->createToken('test-login-token')->plainTextToken;
    echo "✅ Token criado: " . substr($token, 0, 30) . "...\n";

    echo "\n3. Testando autenticação manual...\n";
    $credentials = [
      'email' => 'admin@sysmed.com',
      'password' => 'senha123'
    ];

    if (Auth::attempt($credentials)) {
      echo "✅ Auth::attempt funcionou!\n";
      $authUser = Auth::user();
      echo "Usuário autenticado: {$authUser->name}\n";
    } else {
      echo "❌ Auth::attempt falhou!\n";
    }
  } else {
    echo "❌ Senha não confere!\n";
  }
} else {
  echo "❌ Usuário admin não encontrado!\n";
}

echo "\n=== TESTE CONCLUÍDO ===\n";
