<?php
echo "=== TESTE DE LOGIN REAL VIA API ===\n\n";

// Dados de teste
$testCredentials = [
  [
    'email' => 'admin@sysmed.com',
    'password' => 'senha123',
    'name' => 'Admin Sistema'
  ],
  [
    'email' => 'medico@sysmed.com',
    'password' => 'senha123',
    'name' => 'Dr. João Silva'
  ],
  [
    'email' => 'medico2@sysmed.com',
    'password' => 'senha123',
    'name' => 'Dra. Maria Santos'
  ]
];

foreach ($testCredentials as $i => $cred) {
  echo "=== TESTE " . ($i + 1) . ": {$cred['name']} ===\n";
  echo "Email: {$cred['email']}\n";
  echo "Senha: {$cred['password']}\n\n";

  // Dados para enviar
  $postData = json_encode([
    'email' => $cred['email'],
    'password' => $cred['password']
  ]);

  // Configurar requisição
  $context = stream_context_create([
    'http' => [
      'method' => 'POST',
      'header' => "Content-Type: application/json\r\n" .
        "Accept: application/json\r\n",
      'content' => $postData
    ]
  ]);

  // Fazer requisição
  $url = 'http://localhost:8000/api/login';
  echo "📡 Fazendo requisição para: $url\n";
  echo "📤 Dados enviados: $postData\n\n";

  $response = @file_get_contents($url, false, $context);

  if ($response === FALSE) {
    echo "❌ Erro na requisição\n";
    echo "Detalhes do erro: " . print_r(error_get_last(), true) . "\n\n";
  } else {
    echo "✅ Resposta recebida:\n";

    // Decodificar resposta
    $data = json_decode($response, true);

    if ($data && $data['success']) {
      echo "🎉 LOGIN REALIZADO COM SUCESSO!\n";
      echo "👤 Usuário: {$data['data']['user']['name']}\n";
      echo "📧 Email: {$data['data']['user']['email']}\n";
      echo "🔑 Token: " . substr($data['data']['token'], 0, 20) . "...\n";

      // Testar token imediatamente
      echo "\n📊 Testando acesso ao dashboard...\n";
      $token = $data['data']['token'];

      $dashboardContext = stream_context_create([
        'http' => [
          'method' => 'GET',
          'header' => "Authorization: Bearer $token\r\n" .
            "Accept: application/json\r\n" .
            "Content-Type: application/json\r\n"
        ]
      ]);

      $dashboardResponse = @file_get_contents('http://localhost:8000/api/dashboard/statistics', false, $dashboardContext);

      if ($dashboardResponse === FALSE) {
        echo "❌ Erro ao acessar dashboard\n";
      } else {
        $dashboardData = json_decode($dashboardResponse, true);
        if ($dashboardData && isset($dashboardData['data'])) {
          echo "✅ Dashboard acessível!\n";
          echo "📈 Total de Pacientes: {$dashboardData['data']['overview']['totalPatients']}\n";
          echo "📅 Consultas Hoje: {$dashboardData['data']['overview']['appointmentsToday']}\n";
        } else {
          echo "❌ Resposta inválida do dashboard\n";
          echo "Resposta: $dashboardResponse\n";
        }
      }
    } else {
      echo "❌ LOGIN FALHOU!\n";
      echo "Motivo: " . ($data['message'] ?? 'Erro desconhecido') . "\n";
      echo "Resposta completa: $response\n";
    }
  }

  echo "\n" . str_repeat("=", 80) . "\n\n";
}

echo "🏁 Testes concluídos!\n";
