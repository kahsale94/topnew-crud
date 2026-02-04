import { api } from "./api.js";
import { API_BASE } from "./config.js";
import { handleApiError } from "./feedback.js";
import { state } from "./state.js";

async function carregarUsuarioLogado() {
    try {
        const usuario = await api(`${API_BASE}/usuarios/me`);

        document.getElementById("user-email").textContent = usuario.email;
        document.getElementById("user-btn").textContent =
            `${usuario.email} ▾`;

    } catch (error) {
        console.error("Erro ao carregar usuário", error);
        handleApiError(error);
    }
}

function atualizarIcone(tr, aberto) {
    if (!tr) return;

    const icone = tr.querySelector(".icone-toggle");
    if (!icone) return;

    icone.textContent = aberto ? "🔼" : "🔽";
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

export {
    atualizarIcone,
    carregarUsuarioLogado,
    atualizarFormaPagamentoAutocomplete
};