# Teste da API do Dashboard
$token = "32|BOrxNMzGNGeRiBeYOr8BqGbatakwqSvPgUdDMOWl7127beda"
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

Write-Host "Testando endpoint /api/dashboard/statistics..."
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/dashboard/statistics" -Headers $headers -Method GET
    Write-Host "Sucesso! Resposta:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Erro na requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`nTestando endpoint /api/test..."
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test" -Method GET
    Write-Host "Sucesso! Resposta:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Erro na requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}