<?php
echo "=== CORRIGINDO SENHAS DOS USUÁRIOS ===\n\n";

require_once __DIR__ . '/vendor/autoload.php';

// Boot da aplicação Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "1. Listando usuários atuais...\n";
$users = User::all();

foreach ($users as $user) {
  echo "ID: {$user->id} - {$user->name} ({$user->email})\n";
  echo "Senha atual confere com 'senha123': " . (Hash::check('senha123', $user->password) ? "✅ SIM" : "❌ NÃO") . "\n";

  // Atualizar senha para 'senha123'
  $user->password = Hash::make('senha123');
  $user->save();

  echo "✅ Senha atualizada para 'senha123'\n";
  echo "Verificando novamente: " . (Hash::check('senha123', $user->password) ? "✅ SIM" : "❌ NÃO") . "\n";
  echo "---\n";
}

echo "\n2. Teste final de login...\n";
$testUser = User::where('email', 'admin@sysmed.com')->first();
if ($testUser && Hash::check('senha123', $testUser->password)) {
  echo "✅ Admin pode fazer login com 'senha123'\n";

  // Criar token de teste
  $token = $testUser->createToken('test-token')->plainTextToken;
  echo "✅ Token criado: " . substr($token, 0, 30) . "...\n";
} else {
  echo "❌ Admin ainda não pode fazer login\n";
}

echo "\n=== CORREÇÃO CONCLUÍDA ===\n";
