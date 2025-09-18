<?php
echo "=== TESTE DE LOGIN APÓS MODIFICAÇÕES ===\n\n";

// Teste via cURL
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  'email' => 'admin@sysmed.com',
  'password' => 'senha123'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

echo "🔄 Fazendo requisição para login...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

if ($error) {
  echo "❌ Erro cURL: $error\n";
} else {
  echo "📡 Código HTTP: $httpCode\n";
  echo "📨 Resposta:\n";

  $data = json_decode($response, true);
  if ($data) {
    echo "✅ Resposta JSON válida:\n";
    print_r($data);

    if (isset($data['success']) && $data['success']) {
      echo "\n🎉 LOGIN BEM-SUCEDIDO!\n";
      echo "👤 Usuário: " . $data['data']['user']['name'] . "\n";
      echo "🔑 Token: " . substr($data['data']['token'], 0, 30) . "...\n";
    } else {
      echo "\n❌ LOGIN FALHOU: " . ($data['message'] ?? 'Erro desconhecido') . "\n";
    }
  } else {
    echo "❌ Resposta não é JSON válido:\n";
    echo $response . "\n";
  }
}

echo "\n=== TESTE CONCLUÍDO ===\n";
