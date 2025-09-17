# Debug do Dashboard - SysMed

## Status Atual:

-   ✅ Backend rodando em http://localhost:8000
-   ✅ Frontend rodando em http://localhost:5173
-   ✅ Dados no banco: 3 pacientes, 3 consultas, 3 usuários
-   ✅ Sanctum configurado
-   ✅ Middleware de auth funcionando

## Problemas Identificados:

-   ❌ Dashboard retorna "Erro ao buscar estatísticas"
-   ❓ Logs adicionados para debugar

## Próximos Passos:

1. Verificar logs do Laravel após tentar acessar dashboard
2. Testar endpoint /api/dashboard/test primeiro
3. Verificar se o problema é com queries específicas
4. Checar relacionamentos entre models

## Commands para Debug:

```bash
# Ver logs em tempo real
Get-Content storage\logs\laravel.log -Tail 10 -Wait

# Testar dados do banco
php artisan tinker --execute="echo App\Models\Patient::count();"
```
