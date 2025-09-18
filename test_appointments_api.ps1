# Teste da API de Agendamentos
$BaseUrl = "http://localhost:8000/api"

# Recuperar token dos testes anteriores
$Token = Get-Content "test_token.txt" -ErrorAction SilentlyContinue
if (-not $Token) {
    Write-Host "❌ Token não encontrado. Execute o teste de login primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "🔑 Usando token: $($Token.Substring(0,20))..." -ForegroundColor Green

# Headers para autenticação
$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

Write-Host "`n📅 Testando API de Agendamentos..." -ForegroundColor Cyan

try {
    # 1. Listar agendamentos
    Write-Host "`n1. Listando agendamentos..." -ForegroundColor Yellow
    $Response = Invoke-RestMethod -Uri "$BaseUrl/appointments" -Method GET -Headers $Headers
    
    if ($Response.success) {
        Write-Host "✅ Agendamentos carregados: $($Response.data.Count)" -ForegroundColor Green
        
        if ($Response.data.Count -gt 0) {
            $First = $Response.data[0]
            Write-Host "   📋 Primeiro agendamento:" -ForegroundColor White
            Write-Host "      ID: $($First.id)" -ForegroundColor Gray
            Write-Host "      Paciente: $($First.patient.nome_completo)" -ForegroundColor Gray
            Write-Host "      Data/Hora: $($First.data_hora_inicio)" -ForegroundColor Gray
            Write-Host "      Status: $($First.status)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Erro: $($Response.message)" -ForegroundColor Red
    }

    # 2. Testar filtros
    Write-Host "`n2. Testando filtros por data..." -ForegroundColor Yellow
    $TodayDate = Get-Date -Format "yyyy-MM-dd"
    $TomorrowDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    
    $FilterResponse = Invoke-RestMethod -Uri "$BaseUrl/appointments?start_date=$TodayDate&end_date=$TomorrowDate" -Method GET -Headers $Headers
    
    if ($FilterResponse.success) {
        Write-Host "✅ Agendamentos hoje/amanhã: $($FilterResponse.data.Count)" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro no filtro: $($FilterResponse.message)" -ForegroundColor Red
    }

    # 3. Testar horários disponíveis
    Write-Host "`n3. Testando horários disponíveis..." -ForegroundColor Yellow
    $SlotsResponse = Invoke-RestMethod -Uri "$BaseUrl/appointments/available-slots?doctor_id=1&date=$TodayDate" -Method GET -Headers $Headers
    
    if ($SlotsResponse.success) {
        Write-Host "✅ Horários disponíveis encontrados: $($SlotsResponse.data.Count)" -ForegroundColor Green
        if ($SlotsResponse.data.Count -gt 0) {
            Write-Host "   🕐 Primeiros horários: $($SlotsResponse.data[0..2] -join ', ')" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Erro nos horários: $($SlotsResponse.message)" -ForegroundColor Red
    }

    Write-Host "`n🎉 Teste da API de Agendamentos concluído!" -ForegroundColor Green

} catch {
    Write-Host "❌ Erro durante o teste: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $Stream = $_.Exception.Response.GetResponseStream()
        $Reader = New-Object System.IO.StreamReader($Stream)
        $ErrorBody = $Reader.ReadToEnd()
        Write-Host "   Detalhes: $ErrorBody" -ForegroundColor Red
    }
}