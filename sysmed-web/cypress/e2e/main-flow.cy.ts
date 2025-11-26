describe("Fluxo principal do SysMed", () => {
    const baseUrl = "http://localhost:5173";

    it("faz login e navega até pacientes", () => {
        // Usar credenciais seedadas
        const email = "admin@sysmed.com";
        const password = "senha123";

        cy.visit(`${baseUrl}/login`);

        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password, { log: false });
        cy.contains("button", /entrar/i).click();

        // Deve redirecionar para o dashboard ou raiz
        cy.url().should((url) => {
            expect(url).to.satisfy(
                (u: string) => u.includes("/dashboard") || u.endsWith("/")
            );
        });

        // Abre o menu Pacientes e verifica se a página carregou
        cy.contains("a,button", /pacientes/i).click();
        cy.url().should("include", "/patients");

        // Verifica se a lista ou título de pacientes aparece
        cy.contains(/pacientes/i);
    });
});
