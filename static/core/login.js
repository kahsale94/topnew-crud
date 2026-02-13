import { login } from "../core/auth.js";
import { mostrarErro } from "../core/feedback.js";

if (localStorage.getItem("access_token")) {
    window.location.href = "/";
}

async function handleLogin() {
    
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
        await login(email, senha);
        window.location.href = "/";
    } catch (e) {
        mostrarErro("Email ou senha inválidos");
    }
}

window.handleLogin = handleLogin;