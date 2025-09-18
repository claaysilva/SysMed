<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TESTE DE USUÁRIOS ===\n";
echo "Total de usuários: " . \App\Models\User::count() . "\n";

$users = \App\Models\User::all(['id', 'name', 'email']);
foreach ($users as $user) {
  echo "ID: {$user->id} - Nome: {$user->name} - Email: {$user->email}\n";
}

echo "\n=== TESTE DE LOGIN ===\n";
$user = \App\Models\User::first();
if ($user) {
  echo "Testando login com usuário: {$user->email}\n";
  $token = $user->createToken('test-frontend')->plainTextToken;
  echo "Token gerado: {$token}\n";
} else {
  echo "Nenhum usuário encontrado para teste\n";
}
