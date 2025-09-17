# Documentação da API SysMed

## Autenticação

-   **POST /api/login**
    -   Body: `{ email, password }`
    -   Retorna token JWT para autenticação.

## Pacientes

-   **GET /api/patients**
    -   Lista todos os pacientes.
-   **POST /api/patients**
    -   Cria novo paciente.
-   **GET /api/patients/{id}**
    -   Detalhes de um paciente.
-   **PUT /api/patients/{id}**
    -   Atualiza paciente.
-   **DELETE /api/patients/{id}**
    -   Remove paciente.

## Médicos

-   **GET /api/doctors**
    -   Lista todos os médicos.

## Agendamentos

-   **GET /api/appointments**
    -   Lista todos os agendamentos.
-   **POST /api/appointments**
    -   Cria novo agendamento.
-   **GET /api/appointments/{id}**
    -   Detalhes de um agendamento.
-   **PUT /api/appointments/{id}**
    -   Atualiza agendamento.
-   **DELETE /api/appointments/{id}**
    -   Remove agendamento.

## Prontuário Eletrônico

-   **GET /api/patients/{patientId}/record-entries**
    -   Lista histórico do prontuário do paciente.
-   **POST /api/record-entries**
    -   Cria nova entrada no prontuário.
    -   Body: `{ patient_id, conteudo, appointment_id (opcional) }`

## Fluxo de Uso

1. Usuário faz login e recebe token.
2. Admin cadastra pacientes e médicos.
3. Médico agenda consultas e acessa prontuário do paciente.
4. Médico registra evolução clínica no prontuário após consulta.
5. Paciente pode visualizar seu histórico (futuro: permissões).

## Observações

-   Todas as rotas (exceto login) exigem autenticação via Bearer Token.
-   Validação de campos obrigatórios implementada no frontend.
-   Permissões podem ser expandidas conforme necessidade.

---

Para dúvidas ou onboarding, consulte este arquivo ou entre em contato com o admin do projeto.
