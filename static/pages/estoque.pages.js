import { api } from "../core/api.js";
import { state } from "../core/state.js";
import { API_BASE } from "../core/config.js";
import { mostrarErro, mostrarSucesso, handleApiError } from "../core/feedback.js";

let eventosInicializados = false;

async function carregarEstoque(force = false) {

    if (state.estoque.cache.length && !force) {
        renderEstoque(state.estoque.cache);
        return;
    }

    try {
        const estoque = await api(`${API_BASE}/estoque/`);
        state.estoque.cache = estoque;
        renderEstoque(estoque);
    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

function renderEstoque(lista) {

    const tbody = document.getElementById("estoque-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    lista.forEach(item => {
        tbody.innerHTML += state.estoque.ui.editando === item.num_produto
            ? renderEdicaoEstoque(item)
            : renderNormalEstoque(item);
    });
}

function renderNormalEstoque(e) {

    const status =
        e.estoque_atual <= e.estoque_minimo
            ? "⚠️ Baixo"
            : "✅ Ok";

    return `
        <tr data-id="${e.num_produto}">
            <td>${e.nome_produto}</td>
            <td>${e.estoque_atual}</td>
            <td>${e.estoque_minimo}</td>
            <td>${status}</td>
            <td>
                <button title="Editar" data-action="editar">✏️</button>
                <button title="Zerar" data-action="zerar">🧹</button>
            </td>
        </tr>
    `;
}

function renderEdicaoEstoque(e) {

    return `
        <tr data-id="${e.num_produto}" data-editando="true">
            <td>${e.nome_produto}</td>
            <td>
                <input type="number" data-f="estoque_atual"
                    value="${e.estoque_atual}">
            </td>
            <td>
                <input type="number" data-f="estoque_minimo"
                    value="${e.estoque_minimo}">
            </td>
            <td>—</td>
            <td>
                <button title="Salvar" data-action="salvar">✅</button>
                <button title="Cancelar" data-action="cancelar">❌</button>
            </td>
        </tr>
    `;
}

function editarEstoque(num_produto) {

    if (state.estoque.ui.editando !== null) return;

    state.estoque.ui.editando = num_produto;
    renderEstoque(state.estoque.cache);
}

function cancelarEdicaoEstoque() {

    state.estoque.ui.editando = null;
    renderEstoque(state.estoque.cache);
}

async function salvarEdicaoEstoque(num_produto) {

    const tr = document.querySelector('tr[data-editando="true"]');
    if (!tr) {
        mostrarErro("Nenhum item em edição.");
        return;
    }
    
    const data = {
        estoque_atual: Number(tr.querySelector('[data-f="estoque_atual"]').value),
        estoque_minimo: Number(tr.querySelector('[data-f="estoque_minimo"]').value)
    };
    
    if (isNaN(data.estoque_atual) || isNaN(data.estoque_minimo)) {
        mostrarErro("Preencha os valores corretamente");
        return;
    }

    try {
        await api(`${API_BASE}/estoque/${num_produto}`, "PUT", data);

        state.estoque.ui.editando = null;
        state.estoque.cache = [];

        carregarEstoque(true);

        mostrarSucesso("Estoque atualizado com sucesso!");

    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

async function zerarEstoque(num_produto) {
    
    if (!confirm("Deseja zerar o estoque?")) return;

    try {
        await api(`${API_BASE}/estoque/${num_produto}/zerar`, "PUT");

        state.estoque.cache = [];
        carregarEstoque(true);

        mostrarSucesso("Estoque zerado com sucesso!");

    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

function initEstoqueEventos() {

    const section = document.getElementById("produtos");
    if (!section) return;

    section.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");

        const action = btn.dataset.action;
        if (!action) return;

        switch (action) {

            case "recarregar-estoque":
                carregarEstoque(true);
                break;
        }
    });

    const tbody = document.getElementById("estoque-tbody");
    if (!tbody) return;

    tbody.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const tr = btn.closest("tr[data-id]");
        if (!tr) return;

        const num_produto = Number(tr.dataset.id);
        const action = btn.dataset.action;

        e.stopPropagation();

        switch (action) {
            case "editar":
                editarEstoque(num_produto);
                break;

            case "zerar":
                zerarEstoque(num_produto);
                break;

            case "salvar":
                salvarEdicaoEstoque(num_produto);
                break;

            case "cancelar":
                cancelarEdicaoEstoque();
                break;
        }
    });
}

function initEstoque() {
    carregarEstoque();

    if (!eventosInicializados) {
        initEstoqueEventos();
        eventosInicializados = true;
    }
}

export { initEstoque };