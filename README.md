# SysMed

Sistema de Gestão Médica - Uma aplicação completa para gerenciamento de pacientes e dados médicos.

## Estrutura do Projeto

Este projeto é dividido em duas partes principais:

-   **sysmed-api/**: API backend desenvolvida em Laravel, responsável pela lógica de negócio, autenticação e gerenciamento de dados.
-   **sysmed-web/**: Frontend desenvolvido em React com Vite, para a interface do usuário.

## Tecnologias Utilizadas

### Backend (API)

-   Laravel Framework
-   Laravel Sanctum (para autenticação API)
-   MySQL (banco de dados)
-   PHP

### Frontend (Web)

-   React
-   TypeScript
-   Vite
-   CSS

## Como Executar

### Pré-requisitos

-   PHP 8.1+
-   Composer
-   Node.js 16+
-   MySQL
-   Git

### Instalação

1. Clone o repositório:

    ```bash
    git clone https://github.com/claaysilva/SysMed.git
    cd SysMed
    ```

2. Instale as dependências da API:

    ```bash
    cd sysmed-api
    composer install
    cp ../.env.example .env
    php artisan key:generate
    ```

3. Configure o banco de dados no `.env` e execute as migrações:

    ```bash
    php artisan migrate
    ```

4. Instale as dependências do frontend:

    ```bash
    cd ../sysmed-web
    npm install
    ```

5. Execute o servidor da API:

    ```bash
    cd ../sysmed-api
    php artisan serve
    ```

6. Execute o frontend:
    ```bash
    cd ../sysmed-web
    npm run dev
    ```

## Contribuição

Sinta-se à vontade para contribuir com melhorias, correções de bugs ou novas funcionalidades. Abra uma issue ou envie um pull request.

## Licença

Este projeto está sob a licença MIT.
