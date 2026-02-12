import { api } from "./api.js";
import { logout } from "./auth.js";
import { API_BASE } from "./config.js";
import { mostrarErro } from "./feedback.js";
import { state } from "./state.js";

async function carregarUsuarioLogado() {

    try {
        const usuario = await api(`${API_BASE}/usuarios/me`);
        document.getElementById("user-email").textContent = usuario.email;
        document.getElementById("user-btn").textContent = `${usuario.email} ▾`;
    } catch (error) {
        console.error("Erro ao carregar usuário", error);
        mostrarErro("Erro ao carregar usuário");
    }
}

function atualizarFormaPagamentoAutocomplete() {
    const select = document.getElementById("pedido-forma_pagamento");
    if (!select) return;

    select.innerHTML = `<option value="">Selecione</option>`;

    state.auxiliares.formasPagamento.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
    });
}

async function initUserMenu() {

    await carregarUsuarioLogado();

    const btn = document.getElementById("user-btn");
    const dropdown = document.getElementById("user-dropdown");
    const logoutBtn = document.getElementById("logout-btn");

    btn.addEventListener("click", () => {
        dropdown.classList.toggle("hidden");
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        logout();
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".user-menu")) {
            dropdown.classList.add("hidden");
        }
    });
}

export {
    atualizarFormaPagamentoAutocomplete,
    initUserMenu
};