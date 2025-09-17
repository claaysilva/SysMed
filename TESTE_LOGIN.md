# Teste do SysMed - Dashboard

## Servidores Rodando:

-   Frontend: http://localhost:5173/
-   Backend: http://localhost:8000/

## Usuários de Teste:

### Administrador:

-   Email: `admin@sysmed.com`
-   Senha: `senha123`

### Médicos:

-   Email: `medico@sysmed.com`
-   Senha: `senha123`
-   Nome: Dr. João Silva

-   Email: `medico2@sysmed.com`
-   Senha: `senha123`
-   Nome: Dra. Maria Santos

## Problema Corrigido:

✅ Token de autenticação: Corrigido inconsistência entre `token` e `authToken` no localStorage

## Para testar:

1. Acesse http://localhost:5173/
2. Faça login com qualquer um dos usuários acima
3. Verifique se o dashboard carrega com estatísticas reais
4. ✅ O erro "Token não encontrado" deve ter sido resolvido

## Dados de Demo Disponíveis:

-   3 pacientes cadastrados
-   Consultas agendadas para hoje e amanhã
-   Prontuários médicos preenchidos
-   Templates de relatórios
