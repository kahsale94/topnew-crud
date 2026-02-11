import { api } from "../core/api.js";
import { API_BASE } from "../core/config.js";
import { mostrarErro, mostrarSucesso, handleApiError } from "../core/feedback.js";
import { state } from "../core/state.js";
import { abrirFormulario, fecharFormulario, limparFormulario} from "../core/forms.js";

let eventosInicializados = false;

async function carregarClientes(force = false) {

    if (state.clientes.cache.length && !force) {
        renderClientes(state.clientes.cache);
        return;
    }

    try {
        const clientes = await api(`${API_BASE}/clientes/`);
        state.clientes.cache = clientes;

        renderClientes(clientes);
        atualizarListaClientesAutocomplete();
    } catch (error) {
        console.error(error);
        const tbody = document.getElementById("clientes-tbody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar clientes</td></tr>`;
        }
        handleApiError(error);
    }
}

function renderClientes(clientes) {

    const tbody = document.getElementById("clientes-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    clientes.forEach(cliente => {
        tbody.innerHTML += state.clientes.ui.editando === cliente.num
            ? renderEdicaoClientes(cliente)
            : renderNormalClientes(cliente);
    });
}

function renderNormalClientes(c) {

    return `
        <tr data-id="${c.num}">
            <td data-label="Nº">${c.num}</td>
            <td data-label="Nome">${c.nome}</td>
            <td data-label="Telefone">${c.telefone}</td>
            <td data-label="Endereço">${c.endereco}</td>
            <td data-label="Ações">
                <button title="Editar" data-action="editar">✏️</button>
                <button title="Excluir" data-action="excluir">🗑️</button>
            </td>
        </tr>
    `;
}

function renderEdicaoClientes(c) {

    return `
        <tr data-id="${c.num}" data-editando="true">
            <td data-label="Nº">${c.num}</td>
            <td data-label="Nome"><input value="${c.nome}" data-f="nome"></td>
            <td data-label="Telefone"><input value="${c.telefone}" data-f="telefone"></td>
            <td data-label="Endereço"><input value="${c.endereco}" data-f="endereco"></td>
            <td data-label="Ações">
                <button title="Salvar" data-action="salvar">✅</button>
                <button title="Cancelar" data-action="cancelar">❌</button>
            </td>
        </tr>
    `;
}

async function salvarCliente() {

    if (!document.getElementById("cliente-nome").value) {
        mostrarErro("Informe o nome do cliente!")
        return;
    }

    if (!document.getElementById("cliente-telefone").value) {
        mostrarErro("Informe o telefone do cliente!");
        return;
    }

    if (!document.getElementById("cliente-endereco").value) {
        mostrarErro("Informe o endereço do cliente!");
        return;
    }

    const data = {
        nome: document.getElementById("cliente-nome").value,
        telefone: document.getElementById("cliente-telefone").value,
        endereco: document.getElementById("cliente-endereco").value
    };

    try {
        await api(`${API_BASE}/clientes/clientes`, "POST", data);
        state.clientes.cache = [];
        limparFormulario("cliente");
        carregarClientes(true);

        mostrarSucesso("Cliente criado com sucesso!");

    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
};

function editarCliente(clienteNum) {

    if (state.clientes.ui.editando !== null) return;

    state.clientes.ui.editando = clienteNum;
    renderClientes(state.clientes.cache);
}

async function salvarEdicaoCliente(clienteNum) {

    const tr = document.querySelector('tr[data-editando="true"]');

    if (!tr.querySelector('[data-f="nome"]').value) {
        mostrarErro("Informe o nome do cliente!");
        return;
    }

    if (!tr.querySelector('[data-f="telefone"]').value) {
        mostrarErro("Informe o telefone do cliente!");
        return;
    }

    if (!tr.querySelector('[data-f="endereco"]').value) {
        mostrarErro("Informe o endereço do cliente!");
        return;
    }

    const data = {
        nome: tr.querySelector('[data-f="nome"]').value,
        telefone: tr.querySelector('[data-f="telefone"]').value,
        endereco: tr.querySelector('[data-f="endereco"]').value
    };

    try {
        await api(`${API_BASE}/clientes/clientes/${clienteNum}`, "PUT", data);
        
        state.clientes.ui.editando = null;
        state.clientes.cache = [];
        carregarClientes(true);

        mostrarSucesso("Cliente atualizado com sucesso!");

    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

function cancelarEdicaoCliente() {

    state.clientes.ui.editando = null;
    renderClientes(state.clientes.cache);
}

async function excluirCliente(clienteNum) {

    if (!confirm("Deseja excluir este cliente?")) return;

    try {
        await api(`${API_BASE}/clientes/clientes/${clienteNum}`, "DELETE");

        state.clientes.cache = [];
        carregarClientes(true);

        mostrarSucesso("Cliente excluido com sucesso!");

    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

function atualizarListaClientesAutocomplete() {
    
    const select = document.getElementById("pedido-cliente");
    if (!select) return;
    select.innerHTML = `<option value="">Selecione</option>`;

    state.clientes.cache.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.num;
        opt.textContent = c.nome;
        select.appendChild(opt);
    });
}

function initClientesEventos() {

    const section = document.getElementById("clientes");
    if (!section) return;

    section.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");

        const action = btn.dataset.action;
        if (!action) return;

        switch (action) {

            case "novo-cliente":
                abrirFormulario("cliente");
                break;

            case "cancelar-cliente":
                fecharFormulario("cliente");
                break;

            case "salvar-cliente":
                salvarCliente();
                break;

            case "recarregar-cliente":
                carregarClientes(true);
                break;
        }
    });

    const tbody = document.getElementById("clientes-tbody");
    if (!tbody) return;

    tbody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const tr = btn.closest("tr");
        const clienteId = Number(tr.dataset.id);
        const action = btn.dataset.action;

        if (!clienteId || !action) return;

        switch (action) {
            case "editar":
                editarCliente(clienteId);
                break;

            case "excluir":
                excluirCliente(clienteId);
                break;

            case "salvar":
                salvarEdicaoCliente(clienteId);
                break;

            case "cancelar":
                cancelarEdicaoCliente();
                break;
        }
    });
}


function initClientes() {
    carregarClientes();

    if (!eventosInicializados) {
        initClientesEventos();
        eventosInicializados = true;
    }
}

export {
    initClientes,
    carregarClientes,
    atualizarListaClientesAutocomplete
};