import { api } from "../core/api.js";
import { API_BASE } from "../core/config.js";
import { state } from "../core/state.js";
import { atualizarIcone } from "../core/ui.js";
import { carregarClientes } from "./clientes.pages.js";
import { abrirFormulario, fecharFormulario, limparFormulario} from "../core/forms.js";
import { handleApiError, mostrarErro, mostrarSucesso } from "../core/feedback.js";

let eventosInicializados = false;

async function carregarPedidos(force = false) {

    if (state.pedidos.cache.length && !force) {
        renderPedidos(state.pedidos.cache);
        return;
    }

    try {
        const pedidos = await api(`${API_BASE}/pedidos/`);
        state.pedidos.cache = pedidos;
        renderPedidos(pedidos);
    } catch (error) {
        console.error(error);
        document.getElementById("pedidos-tbody").innerHTML =
            `<tr><td colspan="8">Erro ao carregar pedidos</td></tr>`;
        handleApiError(error);
    }
}

function renderPedidos(pedidos) {

    // PEDIDOS DESKTOP //

    const tbody = document.getElementById("pedidos-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!state.pedidos.ui.pedidoEditando) {
        state.pedidos.ui.pedidoAberto = null;
        state.pedidos.ui.detalhesAbertos = null;
    }

    pedidos.forEach(pedido => {
        const trPedido = document.createElement("tr");
        trPedido.dataset.id = pedido.num;
        trPedido.classList.add("pedido-row");
        trPedido.style.cursor = "pointer";

        if (state.pedidos.ui.pedidoEditando && state.pedidos.ui.pedidoEditando == pedido.num) {
            trPedido.setAttribute("data-editando", "true");
            trPedido.innerHTML = renderEdicaoPedidos(pedido);
        } else {
            trPedido.innerHTML = renderNormalPedidos(pedido);
        }

        const trDetalhes = document.createElement("tr");
        trDetalhes.classList.add("pedido-detalhes", "hidden");

        trDetalhes.innerHTML = `
            <td colspan="5">
                <div class="pedido-detalhes-container">
                    Carregando itens...
                </div>
            </td>
        `;

        tbody.appendChild(trPedido);
        tbody.appendChild(trDetalhes);
    });

    // PEDIDOS MOBILE //

    const mobileContainer = document.getElementById("pedidos-mobile");
    if (mobileContainer) {
        mobileContainer.innerHTML = "";
    }

    pedidos.forEach(pedido => {
        const card = document.createElement("div");
        card.className = "pedido-card";

        card.innerHTML = `
            <div class="pedido-card-header">
                <div class="pedido-cliente">${pedido.nome_cliente}</div>
                <div class="pedido-valor">R$ ${pedido.valor}</div>
            </div>

            <div class="pedido-info">
                Data: ${new Date(pedido.data).toLocaleDateString("pt-BR")}
            </div>

            <div class="pedido-info">
                Status: ${pedido.pago ? "Pago" : "Pendente"}
            </div>

            <div class="pedido-actions">
                <button class="btn secondary">Detalhes</button>
                <button class="btn cancel">Excluir</button>
            </div>
        `;

        if (mobileContainer) {
            mobileContainer.appendChild(card);
        }
    });
}

async function toggleDetalhesPedido(trPedido, pedidoNum) {

    const trDetalhes = trPedido.nextElementSibling;
    if (!trDetalhes || !trDetalhes.classList.contains("pedido-detalhes")) return;

    if (state.pedidos.ui.pedidoAberto === trPedido) {
        trDetalhes.classList.toggle("hidden");
        atualizarIcone(trPedido, !trDetalhes.classList.contains("hidden"));
        return;
    }

    if (state.pedidos.ui.detalhesAbertos) {
        state.pedidos.ui.detalhesAbertos.classList.add("hidden");
        atualizarIcone(state.pedidos.ui.pedidoAberto, false);
    }

    trDetalhes.classList.remove("hidden");
    atualizarIcone(trPedido, true);

    state.pedidos.ui.pedidoAberto = trPedido;
    state.pedidos.ui.detalhesAbertos = trDetalhes;

    if (state.pedidos.itensPorPedido[pedidoNum]) {
        renderItensPedido(trDetalhes, state.pedidos.itensPorPedido[pedidoNum], pedidoNum);
        return;
    }

    try {
        const itens = await api(`${API_BASE}/pedidos/${pedidoNum}`);
        state.pedidos.itensPorPedido[pedidoNum] = itens;
        renderItensPedido(trDetalhes, itens, pedidoNum);
    } catch {
        trDetalhes.querySelector(".pedido-detalhes-container").innerHTML =
            "<p>Erro ao carregar itens</p>";
    }
}


function renderNormalPedidos(pedido) {

    return `
        <td>${pedido.num}</td>
        <td>${pedido.nome_cliente}</td>
        <td>${new Date(pedido.data).toLocaleDateString("pt-BR")}</td>
        <td>R$ ${Number(pedido.valor).toFixed(2)}</td>
        <td>${pedido.forma_pagamento}</td>
        <td>
            <span class="status ${pedido.pago ? "paid" : "pending"}">
                ${pedido.pago ? "✅ Pago" : "⏳ Pendente"}
            </span>
        </td>
        <td class="icone-toggle">🔽</td>
        <td>
            <button title="Editar" data-action="editar">✏️</button>
            <button title="Excluir" data-action="excluir">🗑️</button>
        </td>
    `;
}

function renderEdicaoPedidos(pedido) {

    return `
        <td>${pedido.num}</td>

        <td>
            <select data-f="num_cliente">
                ${state.clientes.cache.map(c =>
                    `<option value="${c.num}" ${c.num === pedido.num_cliente ? "selected" : ""}>
                        ${c.nome}
                    </option>`
                ).join("")}
            </select>
        </td>

        <td>${new Date(pedido.data).toLocaleDateString("pt-BR")}</td>

        <td>R$ ${Number(pedido.valor).toFixed(2)}</td>

        <td>
            <select data-f="forma_pagamento">
                ${state.auxiliares.formasPagamento.map(f =>
                    `<option value="${f}" ${f === pedido.forma_pagamento ? "selected" : ""}>
                        ${f}
                    </option>`
                ).join("")}
            </select>
        </td>

        <td>
            <input type="checkbox" data-f="pago" ${pedido.pago ? "checked" : ""}>
        </td>

        <td class="icone-toggle"></td>

        <td>
            <button title="Salvar" data-action="salvar">✅</button>
            <button title="Cancelar" data-action="cancelar">❌</button>
        </td>
    `;
}

async function editarPedido(pedidoNum) {

    if (state.pedidos.ui.pedidoEditando !== null) return;

    if (!state.clientes.cache.length) {
        await carregarClientes(true);
    }

    state.pedidos.ui.pedidoEditando = pedidoNum;

    renderPedidos(state.pedidos.cache);
}

async function salvarEdicaoPedido(pedidoNum) {

    const tr = document.querySelector('tr[data-editando="true"]');
    if (!tr) {
        mostrarErro("Linha em edição não encontrada");
        return;
    }

    const data = {
        num_cliente: Number(tr.querySelector('[data-f="num_cliente"]').value),
        forma_pagamento: tr.querySelector('[data-f="forma_pagamento"]').value,
        pago: tr.querySelector('[data-f="pago"]').checked
    };

    try {
        await api(`${API_BASE}/pedidos/pedidos/${pedidoNum}`, "PUT", data);

        state.pedidos.ui.pedidoEditando = null;

        state.pedidos.cache = [];
        delete state.pedidos.itensPorPedido[pedidoNum];
        carregarPedidos(true);

        mostrarSucesso("Pedido atualizado com sucesso!");

    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

function cancelarEdicaoPedido() {

    state.pedidos.ui.pedidoEditando = null;
    renderPedidos(state.pedidos.cache);
}


async function excluirPedido(pedidoNum) {

    if (!confirm("Deseja excluir este pedido?")) return;

    try {
        await api(`${API_BASE}/pedidos/pedidos/${pedidoNum}`, "DELETE");

        state.pedidos.cache = [];
        delete state.pedidos.itensPorPedido[pedidoNum];

        carregarPedidos(true);

        mostrarSucesso("Pedido excluido com sucesso!");

    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

/* ================= ITENS PEDIDOS ================= */

function renderItensPedido(trDetalhes, itens, pedidoNum) {

    const container = trDetalhes.querySelector(".pedido-detalhes-container");
    if (!container) return;

    container.innerHTML = `
        <table class="data-table" style="width: 85%">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Valor Unitário</th>
                    <th>Total</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${itens.map(item =>
                    state.pedidos.ui.itemEditando &&
                    state.pedidos.ui.itemEditando.pedidoNum === pedidoNum &&
                    state.pedidos.ui.itemEditando.itemNum === item.num
                    ? renderEdicaoItensPedido(item)
                    : renderNormalItensPedido(item)
                ).join("")}
            </tbody>
        </table>
    `;
}

function renderNormalItensPedido(item) {

    return `
        <tr>
            <td>${state.produtos.cache.find(p => p.num === item.num_produto)?.nome ?? "Produto removido"}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${Number(item.valor_unitario).toFixed(2)}</td>
            <td>R$ ${(item.quantidade * item.valor_unitario).toFixed(2)}</td>
            <td>
                <button title="Editar" data-action="editar-item" data-item="${item.num}">✏️</button>
                <button title="Excluir" data-action="excluir-item" data-item="${item.num}">🗑️</button>
            </td>
        </tr>
    `;
}

function renderEdicaoItensPedido(item) {

    return `
        <tr data-editando="true">
            <td>
                <select data-f="num_produto">
                    ${state.produtos.cache.map(p =>
                        `<option value="${p.num}" ${p.num === item.num_produto ? "selected" : ""}>
                            ${p.nome}
                        </option>`
                    ).join("")}
                </select>
            </td>
            <td><input type="number" value="${item.quantidade}" data-f="quantidade"></td>
            <td><input type="number" step="0.01" value="${item.valor_unitario}" data-f="valor_unitario"></td>
            <td data-subtotal></td>
            <td>
                <button title="Salvar" data-action="salvar-item" data-item="${item.num}">✅</button>
                <button title="Cancelar" data-action="cancelar-item">❌</button>
            </td>
        </tr>
    `;
}


function editarItemPedido(pedidoNum, itemNum) {

    if (state.pedidos.ui.itemEditando) return;

    state.pedidos.ui.itemEditando = { pedidoNum, itemNum };

    renderItensPedido(state.pedidos.ui.detalhesAbertos, state.pedidos.itensPorPedido[pedidoNum], pedidoNum);

    const trEditando = state.pedidos.ui.detalhesAbertos.querySelector('tr[data-editando="true"]');
    if (trEditando) {
        eventosEdicaoItemPedido(trEditando);
    }
}

async function salvarEdicaoItemPedido(pedidoNum, itemNum) {

    const tr = state.pedidos.ui.detalhesAbertos.querySelector('tr[data-editando="true"]');
    if (!tr) {
        mostrarErro("Linha em edição não encontrada");
        return;
    }

    if (!Number(tr.querySelector('[data-f="num_produto"]').value)) {
        mostrarErro("Informe o produto!");
        return;
    }

    if (!Number(tr.querySelector('[data-f="quantidade"]').value)) {
        mostrarErro("Informe o quantidade!");
        return;
    }

    if (Number(tr.querySelector('[data-f="valor_unitario"]').value) <= 0) {
        mostrarErro("Valor precisa ser mais que 0!");
        return;
    }

    const data = {
        item: {
            num_produto: Number(tr.querySelector('[data-f="num_produto"]').value),
            quantidade: Number(tr.querySelector('[data-f="quantidade"]').value),
            valor_unitario: Number(tr.querySelector('[data-f="valor_unitario"]').value)
        }
    };

    try {
        await api(`${API_BASE}/pedidos/pedidos/${pedidoNum}/${itemNum}`, "PUT", data);

        state.pedidos.ui.itemEditando = null;

        delete state.pedidos.itensPorPedido[pedidoNum];

        const itensAtualizados = await api(`${API_BASE}/pedidos/${pedidoNum}`);
        state.pedidos.itensPorPedido[pedidoNum] = itensAtualizados;

        renderItensPedido(state.pedidos.ui.detalhesAbertos, itensAtualizados, pedidoNum);
        carregarPedidos(true);

        mostrarSucesso("Item atualizado com sucesso!");
    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}


function cancelarEdicaoItemPedido() {

    if (!state.pedidos.ui.itemEditando) return;

    const { pedidoNum } = state.pedidos.ui.itemEditando;
    state.pedidos.ui.itemEditando = null;

    renderItensPedido(state.pedidos.ui.detalhesAbertos, state.pedidos.itensPorPedido[pedidoNum], pedidoNum);

    const trEditando = state.pedidos.ui.detalhesAbertos.querySelector('tr[data-editando="true"]');
    if (trEditando) {
        eventosEdicaoItemPedido(trEditando);
    }
}

async function excluirItemPedido(pedidoNum, itemNum) {

    if (!confirm("Deseja remover este item?")) return;

    try {
        await api(`${API_BASE}/pedidos/pedidos/${pedidoNum}/${itemNum}`, "DELETE");

        state.pedidos.cache = [];
        delete state.pedidos.itensPorPedido[pedidoNum];

        carregarPedidos(true);

        mostrarSucesso("Item excluido com sucesso!");
    
    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

function eventosEdicaoItemPedido(tr) {

    tr.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", () => {
            atualizarSubtotalEdicao(tr);
        });
    });

    atualizarSubtotalEdicao(tr);
}

/* ================= NOVO PEDIDO FORMULARIO ================= */

function renderItensNovoPedido() {

    const tbody = document.getElementById("itens-pedido-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    state.pedidos.itensNovoPedido.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <select class="select-produto" data-i="${index}" data-f="num_produto">
                    <option value="">Selecione</option>
                    ${state.produtos.cache.map(p =>
                        `<option value="${p.num}" ${p.num === item.num_produto ? "selected" : ""}>
                            ${p.nome}
                        </option>`
                    ).join("")}
                </select>
            </td>
            <td>
                <input
                    type="number"
                    value="${item.quantidade}"
                    data-i="${index}"
                    data-f="quantidade"
                >
            </td>
            <td>
                <input
                    type="number"
                    step="0.01"
                    value="${item.valor_unitario}"
                    data-i="${index}"
                    data-f="valor_unitario"
                >
            </td>
            <td data-subtotal="${index}">
                R$ ${(item.quantidade * item.valor_unitario).toFixed(2)}</td>
            <td>
                <button data-r="${index}">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", e => {
            const i = e.target.dataset.i;
            const f = e.target.dataset.f;
            state.pedidos.itensNovoPedido[i][f] =
                f === "num_produto"
                    ? e.target.value
                    : Number(e.target.value);

            atualizarSubtotalItem(i);
            calcularTotalPedido();
        });
    });

    tbody.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            state.pedidos.itensNovoPedido.splice(btn.dataset.r, 1);
            renderItensNovoPedido();
        });
    });

    tbody.querySelectorAll(".select-produto").forEach(select => {
        select.addEventListener("change", e => {
            const index = e.target.dataset.i;
            const produto = state.produtos.cache.find(p => p.num == e.target.value);

            if (produto) {
            state.pedidos.itensNovoPedido[index].num_produto = produto.num;
            state.pedidos.itensNovoPedido[index].valor_unitario = Number(produto.valor_venda);
            renderItensNovoPedido();
            }
        });
    });
    calcularTotalPedido();
}

async function salvarPedido() {

    if (!document.getElementById("pedido-cliente").value) {
        mostrarErro("Informe o nome do cliente!");
        return;
    }

    if (state.pedidos.itensNovoPedido.length === 0) {
        mostrarErro("Adicione pelo menos um item!");
        return;
    }

    for (const item of state.pedidos.itensNovoPedido) {
        if (!item.num_produto || item.quantidade <= 0 || item.valor_unitario <= 0) {
            mostrarErro("Preencha todos os itens corretamente!");
            return;
        }
    }

    if (!document.getElementById("pedido-forma_pagamento").value) {
        mostrarErro("Informe a forma de pagamento!");
        return;
    }

    const data = {
        num_cliente: document.getElementById("pedido-cliente").value,
        itens: state.pedidos.itensNovoPedido.map(i => ({
            num_produto: i.num_produto,
            quantidade: i.quantidade,
            valor_unitario: i.valor_unitario
        })),
        forma_pagamento: document.getElementById("pedido-forma_pagamento").value,
        pago: document.getElementById("pedido-pago").checked,
    };

    try {
        await api(`${API_BASE}/pedidos/pedidos`, "POST", data);

        state.pedidos.cache = [];
        state.pedidos.itensNovoPedido.length = 0;

        renderItensNovoPedido();
        limparFormulario("pedido");
        carregarPedidos(true);

        mostrarSucesso("Pedido criado com sucesso!");

    } catch (error){
        console.log(error)
        handleApiError(error)
    }
};

/* ================= CALCULOS DO PEDIDO FORM ================= */

function calcularTotalPedido() {

    const total = state.pedidos.itensNovoPedido.reduce((acc, item) => {
        return acc + (item.quantidade * item.valor_unitario);
    }, 0);

    const cell = document.getElementById("pedido-total");

    if (cell) {
        cell.textContent = `R$ ${total.toFixed(2)}`;
    }
}

function atualizarSubtotalItem(index) {

    const item = state.pedidos.itensNovoPedido[index];
    const subtotal = item.quantidade * item.valor_unitario;
    const cell = document.querySelector(`[data-subtotal="${index}"]`);

    if (cell) {
        cell.textContent = `R$ ${subtotal.toFixed(2)}`;
    }
}

function atualizarSubtotalEdicao(tr) {

    const qtd = Number(tr.querySelector('[data-f="quantidade"]').value) || 0;
    const valor = Number(tr.querySelector('[data-f="valor_unitario"]').value) || 0;
    const subtotal = qtd * valor;

    const cell = tr.querySelector('[data-subtotal]');

    if (cell) {
        cell.textContent = `R$ ${subtotal.toFixed(2)}`;
    }
}

function initItensPedidoEventos() {

    const tbody = document.getElementById("pedidos-tbody");
    if (!tbody) return;

    tbody.addEventListener("click", async (e) => {

        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const detalhes = btn.closest(".pedido-detalhes");
        if (!detalhes) return;

        e.stopPropagation();

        const action = btn.dataset.action;
        const itemNum = Number(btn.dataset.item);
        const pedidoNum = Number(state.pedidos.ui.pedidoAberto?.dataset?.id);

        if (!pedidoNum) return;

        switch (action) {
            case "editar-item":
                editarItemPedido(pedidoNum, itemNum);
                break;

            case "excluir-item":
                excluirItemPedido(pedidoNum, itemNum);
                break;

            case "salvar-item":
                salvarEdicaoItemPedido(pedidoNum, itemNum);
                break;

            case "cancelar-item":
                cancelarEdicaoItemPedido();
                break;
        }
    });
}

function initPedidosEventos() {

    const section = document.getElementById("pedidos");
    if (!section) return;

    section.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");

        const action = btn.dataset.action;
        if (!action) return;

        switch (action) {

            case "novo-pedido":
                abrirFormulario("pedido");
                break;

            case "adicionar-item":
                state.pedidos.itensNovoPedido.push({
                    num_produto: null,
                    quantidade: 1,
                    valor_unitario: 0
                })
                renderItensNovoPedido();
                break;

            case "cancelar-pedido":
                fecharFormulario("pedido");
                break;

            case "salvar-pedido":
                salvarPedido();
                break;

            case "recarregar-pedidos":
                carregarPedidos(true);
                break;
        }
    });

    const tbody = document.getElementById("pedidos-tbody");
    if (!tbody) return;

    tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        const tr = e.target.closest("tr");

        if (!tr || !tr.dataset.id) return;

        const pedidoNum = Number(tr.dataset.id);

        if (!btn) {
            if (state.pedidos.ui.pedidoEditando) return;
            toggleDetalhesPedido(tr, pedidoNum);
            return;
        }

        const action = btn.dataset.action;
        if (!action) return;

        e.stopPropagation();

        switch (action) {

            case "editar":
                editarPedido(pedidoNum);
                break;

            case "excluir":
                excluirPedido(pedidoNum);
                break;

            case "salvar":
                salvarEdicaoPedido(pedidoNum);
                break;

            case "cancelar":
                cancelarEdicaoPedido();
                break;
        }
    });
}

function initPedidos() {
    carregarPedidos();
    
    if (!eventosInicializados) {
        initPedidosEventos();
        initItensPedidoEventos();
        eventosInicializados = true;
    }
}

export {
    initPedidos,
};