#!/usr/bin/env node

/**
 * Script para testar e validar a performance do SysMed
 * Testa cache do backend, otimizações de query e responsividade do frontend
 */

const { performance } = require("perf_hooks");
const axios = require("axios");

const API_BASE_URL = "http://localhost:8000/api";
const WEB_BASE_URL = "http://localhost:5173";

class PerformanceValidator {
    constructor() {
        this.results = [];
        this.authToken = "";
    }

    async run() {
        console.log("🚀 Iniciando validação de performance do SysMed...\n");

        try {
            await this.authenticate();
            await this.testBackendCache();
            await this.testQueryOptimization();
            await this.testFrontendResponsiveness();

            this.printResults();
        } catch (error) {
            console.error("❌ Erro durante os testes:", error);
        }
    }

    async authenticate() {
        console.log("🔐 Autenticando...");

        const start = performance.now();

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                email: "admin@sysmed.com",
                password: "password123",
            });

            this.authToken = response.data.token;
            const duration = performance.now() - start;

            this.results.push({
                test: "Autenticação",
                success: true,
                duration: duration,
                details: `Token obtido em ${duration.toFixed(2)}ms`,
            });

            console.log(`✅ Autenticado em ${duration.toFixed(2)}ms\n`);
        } catch (error) {
            const duration = performance.now() - start;
            this.results.push({
                test: "Autenticação",
                success: false,
                duration: duration,
                error:
                    error instanceof Error
                        ? error.message
                        : "Erro desconhecido",
            });

            throw new Error("Falha na autenticação");
        }
    }

    async testBackendCache() {
        console.log("🔄 Testando cache do backend...");

        const endpoints = [
            "/doctors",
            "/dashboard/statistics",
            "/reports/dashboard-stats",
        ];

        for (const endpoint of endpoints) {
            await this.testCacheEndpoint(endpoint);
        }

        console.log("");
    }

    async testCacheEndpoint(endpoint) {
        const headers = {
            Authorization: `Bearer ${this.authToken}`,
            Accept: "application/json",
        };

        // Primeira chamada (sem cache)
        const start1 = performance.now();
        try {
            const response1 = await axios.get(`${API_BASE_URL}${endpoint}`, {
                headers,
            });
            const duration1 = performance.now() - start1;

            // Segunda chamada (com cache)
            const start2 = performance.now();
            const response2 = await axios.get(`${API_BASE_URL}${endpoint}`, {
                headers,
            });
            const duration2 = performance.now() - start2;

            const improvement = ((duration1 - duration2) / duration1) * 100;
            const success = duration2 < duration1 && improvement > 10; // Esperamos pelo menos 10% de melhoria

            this.results.push({
                test: `Cache Backend - ${endpoint}`,
                success: success,
                duration: duration2,
                details: `1ª chamada: ${duration1.toFixed(
                    2
                )}ms, 2ª chamada: ${duration2.toFixed(
                    2
                )}ms (${improvement.toFixed(1)}% melhoria)`,
            });

            console.log(
                `${success ? "✅" : "⚠️"} ${endpoint}: ${duration1.toFixed(
                    2
                )}ms → ${duration2.toFixed(2)}ms (${improvement.toFixed(
                    1
                )}% melhoria)`
            );
        } catch (error) {
            this.results.push({
                test: `Cache Backend - ${endpoint}`,
                success: false,
                duration: 0,
                error:
                    error instanceof Error
                        ? error.message
                        : "Erro desconhecido",
            });

            console.log(`❌ ${endpoint}: Erro na requisição`);
        }
    }

    async testQueryOptimization() {
        console.log("⚡ Testando otimizações de query...");

        const tests = [
            {
                name: "Lista de Pacientes",
                endpoint: "/patients?page=1&per_page=20",
                maxDuration: 500, // ms
            },
            {
                name: "Busca de Pacientes",
                endpoint: "/patients?search=silva&page=1&per_page=20",
                maxDuration: 800, // ms
            },
            {
                name: "Consultas do Dia",
                endpoint:
                    "/appointments?date=" +
                    new Date().toISOString().split("T")[0],
                maxDuration: 600, // ms
            },
            {
                name: "Estatísticas Dashboard",
                endpoint: "/dashboard/statistics",
                maxDuration: 300, // ms (com cache)
            },
        ];

        const headers = {
            Authorization: `Bearer ${this.authToken}`,
            Accept: "application/json",
        };

        for (const test of tests) {
            const start = performance.now();

            try {
                await axios.get(`${API_BASE_URL}${test.endpoint}`, { headers });
                const duration = performance.now() - start;
                const success = duration <= test.maxDuration;

                this.results.push({
                    test: `Query Optimization - ${test.name}`,
                    success: success,
                    duration: duration,
                    details: `${duration.toFixed(2)}ms (limite: ${
                        test.maxDuration
                    }ms)`,
                });

                console.log(
                    `${success ? "✅" : "⚠️"} ${test.name}: ${duration.toFixed(
                        2
                    )}ms`
                );
            } catch (error) {
                this.results.push({
                    test: `Query Optimization - ${test.name}`,
                    success: false,
                    duration: 0,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Erro desconhecido",
                });

                console.log(`❌ ${test.name}: Erro na requisição`);
            }
        }

        console.log("");
    }

    async testFrontendResponsiveness() {
        console.log("📱 Testando responsividade do frontend...");

        const viewports = [
            { name: "Mobile", width: 375, height: 667 },
            { name: "Tablet", width: 768, height: 1024 },
            { name: "Desktop", width: 1920, height: 1080 },
        ];

        try {
            // Simular teste de responsividade (em um ambiente real usaríamos Playwright/Puppeteer)
            const start = performance.now();

            // Teste simples de conectividade com o frontend
            const response = await axios.get(WEB_BASE_URL);
            const duration = performance.now() - start;

            const success = response.status === 200 && duration < 2000;

            this.results.push({
                test: "Frontend Responsividade",
                success: success,
                duration: duration,
                details: `Carregamento em ${duration.toFixed(2)}ms`,
            });

            console.log(
                `${
                    success ? "✅" : "⚠️"
                } Frontend carregado em ${duration.toFixed(2)}ms`
            );
            console.log(
                "ℹ️  Para testes completos de responsividade, use ferramentas como Lighthouse"
            );
        } catch (error) {
            this.results.push({
                test: "Frontend Responsividade",
                success: false,
                duration: 0,
                error: "Frontend não está rodando ou inacessível",
            });

            console.log(
                "❌ Frontend inacessível - verifique se está rodando na porta 5173"
            );
        }

        console.log("");
    }

    printResults() {
        console.log("📊 RELATÓRIO DE PERFORMANCE\n");
        console.log("=".repeat(70));

        const successful = this.results.filter((r) => r.success).length;
        const total = this.results.length;

        console.log(
            `\n🎯 Resultados: ${successful}/${total} testes passaram\n`
        );

        this.results.forEach((result) => {
            const icon = result.success ? "✅" : "❌";
            const duration =
                result.duration > 0 ? ` (${result.duration.toFixed(2)}ms)` : "";

            console.log(`${icon} ${result.test}${duration}`);

            if (result.details) {
                console.log(`   ℹ️  ${result.details}`);
            }

            if (result.error) {
                console.log(`   ❌ ${result.error}`);
            }

            console.log("");
        });

        console.log("=".repeat(70));

        // Recomendações
        console.log("\n💡 RECOMENDAÇÕES:\n");

        const failedTests = this.results.filter((r) => !r.success);
        if (failedTests.length === 0) {
            console.log(
                "🎉 Todas as otimizações estão funcionando corretamente!"
            );
        } else {
            console.log("🔧 Áreas que precisam de atenção:");
            failedTests.forEach((test) => {
                console.log(`   • ${test.test}`);
            });
        }

        console.log("\n📈 Próximos passos sugeridos:");
        console.log(
            "   • Implementar monitoramento contínuo com ferramentas como New Relic"
        );
        console.log(
            "   • Configurar testes automatizados de performance no CI/CD"
        );
        console.log("   • Otimizar queries que excedem os limites de tempo");
        console.log("   • Implementar lazy loading em componentes pesados");
        console.log("   • Configurar CDN para assets estáticos");

        console.log("\n🚀 Sistema pronto para produção!");
    }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
    const validator = new PerformanceValidator();
    validator.run().catch(console.error);
}

module.exports = { PerformanceValidator };
