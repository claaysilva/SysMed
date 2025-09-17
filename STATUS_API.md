# Teste da API do Dashboard

## Status dos Serviços:

-   Backend: http://localhost:8000
-   Frontend: http://localhost:5173

## Problemas Resolvidos:

✅ Migrações duplicadas removidas
✅ Ordem das migrações corrigida (report_templates antes de reports)
✅ Fresh migration executada com sucesso
✅ Seeders executados com dados de demonstração
✅ Sanctum Guard adicionado ao config/auth.php
✅ Middleware de autenticação configurado para retornar JSON em APIs
✅ Servidores backend e frontend reiniciados

## Para Testar:

1. Login: admin@sysmed.com / senha123
2. Endpoint de teste: http://localhost:8000/api/test
3. Dashboard: http://localhost:8000/api/dashboard/statistics (requer auth)

## Usuários Disponíveis:

-   admin@sysmed.com (Admin)
-   medico@sysmed.com (Dr. João Silva)
-   medico2@sysmed.com (Dra. Maria Santos)

Senha para todos: senha123

## Últimas Correções:

-   Configurado Sanctum Guard para autenticação
-   Middleware configurado para retornar erro JSON (401) em vez de redirecionar
-   Adicionado EnsureFrontendRequestsAreStateful middleware
