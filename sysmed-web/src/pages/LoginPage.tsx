import React from "react";

const LoginPage: React.FC = () => {
    return (
        <div>
            <h2>Login - SysMed</h2>
            <form>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" />
                </div>
                <div>
                    <label htmlFor="password">Senha:</label>
                    <input type="password" id="password" name="password" />
                </div>
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
};

export default LoginPage;
