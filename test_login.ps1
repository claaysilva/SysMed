try {
    $body = @{
        email = "admin@sysmed.com"
        password = "senha123"
    } | ConvertTo-Json

    Write-Host "Testando login com: $body"
    
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
    
} catch {
    Write-Host "Erro: $($_.Exception.Message)"
    Write-Host "Details: $($_.Exception)"
}