import { state } from "./state.js";
import { carregarClientes, atualizarListaClientesAutocomplete } from "../pages/clientes.pages.js";
import { atualizarFormaPagamentoAutocomplete } from "./ui.js";

function abrirFormulario(tipo) {
    const form = document.getElementById(`form-${tipo}`);
    if (!form) return;

    form.classList.remove("hidden");

    if (tipo === "pedido") {
        prepararFormularioPedido();
    }
}

function fecharFormulario(tipo) {
    const form = document.getElementById(`form-${tipo}`);
    if (!form) return;

    form.classList.add("hidden");

    limparFormulario(tipo);
}

/* =======================
   PREPARAÇÃO
======================= */

function prepararFormularioPedido() {
    if (!state.clientes.cache.length) {
        carregarClientes(true);
    }

    atualizarListaClientesAutocomplete();
    atualizarFormaPagamentoAutocomplete();
}

/* =======================
   LIMPEZA
======================= */

function limparFormulario(tipo) {
    switch (tipo) {
        case "pedido":
            limparFormularioPedido();
            break;
        case "cliente":
            limparFormularioCliente();
            break;
        case "produto":
            limparFormularioProduto();
            break;
    }
}

function limparFormularioPedido() {
    document.getElementById("pedido-cliente").value = "";
    
    document.getElementById("pedido-forma_pagamento").value = "";

    document.getElementById("pedido-pago").checked = false;

    state.pedidos.itensNovoPedido = [];

    const tbody = document.getElementById("itens-pedido-tbody");
    if (tbody) tbody.innerHTML = "";

    const total = document.getElementById("pedido-total");
    if (total) total.textContent = "R$ 0,00";
}

function limparFormularioCliente() {
    document.getElementById("cliente-nome").value = "";
    document.getElementById("cliente-telefone").value = "";
    document.getElementById("cliente-endereco").value = "";
}

function limparFormularioProduto() {
    document.getElementById("produto-nome").value = "";
    document.getElementById("produto-descricao").value = "";
    document.getElementById("produto-valor_compra").value = "";
    document.getElementById("produto-valor_venda").value = "";
    document.getElementById("produto-categoria").value = "";
}

export {
    abrirFormulario,
    fecharFormulario,
    limparFormulario
};