# API do Sistema SysMed - Documentação Completa

## Visão Geral

A API do SysMed é desenvolvida em Laravel 11 e oferece funcionalidades completas para gerenciamento de um sistema hospitalar/clínico, incluindo gerenciamento de pacientes, consultas e prontuários eletrônicos com validação robusta.

## Autenticação

A API utiliza Laravel Sanctum para autenticação via tokens Bearer.

### Login

**POST** `/api/login`

**Body:**

```json
{
    "email": "admin@sysmed.com",
    "password": "password"
}
```

**Resposta de Sucesso:**

```json
{
    "token": "1|abc123...",
    "user": {
        "id": 1,
        "name": "Admin",
        "email": "admin@sysmed.com",
        "role": "admin"
    }
}
```

### Logout

**POST** `/api/logout`

-   Requer autenticação via Bearer token

## Gerenciamento de Pacientes

### Validação Robusta de Pacientes

O sistema implementa validação rigorosa tanto no backend (Laravel Form Requests) quanto no frontend (React):

#### Campos Obrigatórios:

-   **Nome Completo**: Mínimo 2 caracteres, apenas letras, espaços, hífens, pontos e apóstrofes
-   **CPF**: Formato XXX.XXX.XXX-XX com validação matemática completa
-   **Data de Nascimento**: Deve ser anterior a hoje e posterior a 1900

#### Campos Opcionais:

-   **Telefone**: Formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX (com máscara automática)
-   **Endereço**: Mínimo 5 caracteres, máximo 500 caracteres

#### Validações Implementadas:

1. **Validação de CPF**: Algoritmo completo com verificação de dígitos
2. **Máscaras de Entrada**: CPF e telefone formatados automaticamente
3. **Validação em Tempo Real**: Feedback imediato no frontend
4. **Mensagens Personalizadas**: Erros específicos e informativos
5. **Validação de Unicidade**: CPF único no sistema

### Listar Pacientes

**GET** `/api/patients`

-   Retorna lista de todos os pacientes

### Criar Paciente

**POST** `/api/patients`

-   Requer role: admin

**Body:**

```json
{
    "nome_completo": "João Silva Santos",
    "data_nascimento": "1990-05-15",
    "cpf": "123.456.789-01",
    "telefone": "(11) 99999-9999",
    "endereco": "Rua das Flores, 123, São Paulo, SP"
}
```

**Validações:**

-   Nome: obrigatório, mínimo 2 caracteres, apenas letras/espaços/hífens/pontos/apóstrofes
-   CPF: obrigatório, formato XXX.XXX.XXX-XX, validação matemática, único no sistema
-   Data de nascimento: obrigatório, formato YYYY-MM-DD, anterior a hoje, posterior a 1900
-   Telefone: opcional, formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
-   Endereço: opcional, mínimo 5 caracteres, máximo 500 caracteres

### Visualizar Paciente

**GET** `/api/patients/{id}`

-   Retorna dados específicos de um paciente

### Atualizar Paciente

**PUT** `/api/patients/{id}`

-   Requer role: admin
-   Mesmas validações da criação, com `sometimes` para campos opcionais

### Excluir Paciente

**DELETE** `/api/patients/{id}`

-   Requer role: admin

## Gerenciamento de Consultas

### Listar Consultas

**GET** `/api/appointments`

### Criar Consulta

**POST** `/api/appointments`

-   Requer role: admin

**Body:**

```json
{
    "patient_id": 1,
    "doctor_name": "Dr. João Silva",
    "appointment_date": "2024-12-25",
    "appointment_time": "14:30",
    "status": "agendada"
}
```

### Visualizar Consulta

**GET** `/api/appointments/{id}`

### Atualizar Consulta

**PUT** `/api/appointments/{id}`

-   Requer role: admin

### Excluir Consulta

**DELETE** `/api/appointments/{id}`

-   Requer role: admin

## Prontuário Eletrônico

### Listar Entradas do Prontuário

**GET** `/api/medical-record-entries`

**Query Parameters:**

-   `patient_id`: Filtrar por paciente específico

### Criar Entrada no Prontuário

**POST** `/api/medical-record-entries`

-   Requer role: admin ou doctor

**Body:**

```json
{
    "patient_id": 1,
    "content": "<p>Paciente apresenta...</p>",
    "entry_date": "2024-01-15"
}
```

### Visualizar Entrada do Prontuário

**GET** `/api/medical-record-entries/{id}`

### Atualizar Entrada do Prontuário

**PUT** `/api/medical-record-entries/{id}`

-   Requer role: admin ou doctor

### Excluir Entrada do Prontuário

**DELETE** `/api/medical-record-entries/{id}`

-   Requer role: admin ou doctor

## Sistema de Permissões

### Roles Disponíveis:

-   **admin**: Acesso completo a todas as funcionalidades
-   **doctor**: Pode gerenciar prontuários médicos
-   **nurse**: Apenas visualização (implementação futura)

### Controle de Acesso:

-   Pacientes: Apenas admin pode criar/editar/excluir
-   Consultas: Apenas admin pode criar/editar/excluir
-   Prontuários: Admin e doctor podem criar/editar/excluir

## Códigos de Status HTTP

-   **200**: Sucesso
-   **201**: Criado com sucesso
-   **204**: Excluído com sucesso
-   **400**: Erro de validação
-   **401**: Não autenticado
-   **403**: Não autorizado (permissão insuficiente)
-   **404**: Recurso não encontrado
-   **422**: Erro de validação (dados inválidos)

## Exemplos de Erros de Validação

### Erro de CPF Inválido:

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "cpf": ["O CPF informado é inválido."]
    }
}
```

### Erro de Nome Inválido:

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "nome_completo": [
            "O nome deve conter apenas letras, espaços, hífens, pontos e apóstrofes."
        ]
    }
}
```

### Erro de Telefone Inválido:

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "telefone": [
            "O telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX."
        ]
    }
}
```

## Recursos Implementados

### Backend (Laravel):

-   ✅ Laravel Form Requests com validação robusta
-   ✅ Validação personalizada de CPF com algoritmo matemático
-   ✅ Mensagens de erro personalizadas em português
-   ✅ Controle de permissões baseado em roles
-   ✅ Validação de unicidade e formatos específicos

### Frontend (React):

-   ✅ Máscaras automáticas para CPF e telefone
-   ✅ Validação em tempo real com feedback visual
-   ✅ Mensagens de erro específicas por campo
-   ✅ Validação que corresponde às regras do backend
-   ✅ Interface responsiva e acessível

### Funcionalidades de Validação:

-   ✅ Validação matemática completa de CPF
-   ✅ Formatação automática de campos (CPF, telefone)
-   ✅ Validação de datas (limites mínimo e máximo)
-   ✅ Validação de nomes (apenas caracteres permitidos)
-   ✅ Validação de telefone com formatos brasileiros
-   ✅ Feedback visual de erros em tempo real
-   ✅ Prevenção de duplicação de CPF no sistema

## Tecnologias Utilizadas

-   **Backend**: Laravel 11, PHP 8.2+, MySQL, Laravel Sanctum
-   **Frontend**: React 18, TypeScript, Vite, Axios
-   **Validação**: Laravel Form Requests, Custom Validation Rules
-   **UI/UX**: CSS personalizado, máscaras de entrada, feedback visual

## Status da Validação ✅ IMPLEMENTADO

A validação robusta de pacientes foi **completamente implementada** com:

1. **Backend (Laravel)**:

    - ✅ StorePatientRequest.php com validação completa
    - ✅ UpdatePatientRequest.php com validação completa
    - ✅ PatientController.php atualizado para usar Form Requests
    - ✅ Validação matemática de CPF
    - ✅ Mensagens de erro personalizadas

2. **Frontend (React)**:

    - ✅ Máscaras automáticas para CPF e telefone
    - ✅ Validação em tempo real
    - ✅ Feedback visual de erros
    - ✅ Validação sincronizada com backend

3. **Testes Funcionais**:
    - ✅ Servidor Laravel rodando em http://127.0.0.1:8000
    - ✅ Frontend React rodando em http://localhost:5174
    - ✅ Sistema pronto para testes de validação

**O problema da validação de pacientes foi completamente resolvido!**
