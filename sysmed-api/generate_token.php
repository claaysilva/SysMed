<?php

use App\Models\User;

$user = User::first();
if ($user) {
  $token = $user->createToken('test-token')->plainTextToken;
  echo "Token gerado: " . $token . "\n";
  echo "User ID: " . $user->id . "\n";
  echo "User Name: " . $user->name . "\n";
} else {
  echo "Nenhum usuário encontrado\n";
}
