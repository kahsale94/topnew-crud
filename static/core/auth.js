import { API_BASE } from "./config.js";
import { state } from "./state.js";

async function login(email, senha) {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", senha);

    const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: form.toString()
    });

    if (!response.ok) {
        throw new Error("Email ou senha inválidos");
    }

    const data = await response.json();

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
}

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
}

export {
    login,
    logout
};