/* ================= CONFIG ================= */

let itensPedido = [];
let produtosCache = [];
let cachePedidos = null;
let cacheClientes = null;
let cacheProdutos = null;
let cacheFormasPagamento = [
    "Cartão de Crédito",
    "Cartão de Débito",
    "Pix",
    "Dinheiro",
];
let cacheItensPedido = {};
let pedidoAbertoAtual = null;
let detalhesAbertosAtual = null;
let itemEditando = null;
let backupItem = null;
let clienteEditando = null;
let backupCliente = null;
let produtoEditando = null;
let backupProduto = null;
let pedidoEditando = null;
let backupPedido = null;

/* ================= TABS ================= */

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", async () => {

        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");

        switch (tab.dataset.tab) {
            case "pedidos":
                await carregarPedidos();
                break;
            case "clientes":
                await carregarClientes();
                break;
            case "produtos":
                await carregarProdutos();
                break;
        }
    });
});

/* ================= LOADERS ================= */

async function carregarProdutosCache() {
    produtosCache = await api(`${API_BASE}/produtos/`);
}

document.addEventListener("DOMContentLoaded", async () => {

    if (!verificarAuth()) return;

    const btn = document.getElementById("user-btn");
    const dropdown = document.getElementById("user-dropdown");
    const logoutBtn = document.getElementById("logout-btn");

    btn.addEventListener("click", () => {
        dropdown.classList.toggle("hidden");
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/login";
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".user-menu")) {
            dropdown.classList.add("hidden");
        }
    });

    await carregarProdutosCache();

    document.getElementById("btn-add-item")?.addEventListener("click", () => {
        itensPedido.push({
            num_produto: null,
            quantidade: 1,
            valor_unitario: 0
        });
        renderItensNovoPedido();
    });

    document.getElementById("btn-salvar-pedido")?.addEventListener("click", salvarPedido);
    document.getElementById("btn-salvar-produto")?.addEventListener("click", salvarProduto);
    document.getElementById("btn-salvar-cliente")?.addEventListener("click", salvarCliente);

    const abaAtiva = document.querySelector(".tab.active");

    if (!abaAtiva) return;

    switch (abaAtiva.dataset.tab) {
        case "pedidos":
            await carregarPedidos();
            break;
        case "clientes":
            await carregarClientes();
            break;
        case "produtos":
            await carregarProdutos();
            break;
    }

    await carregarUsuarioLogado();
});


/* ================= CLIENTES ================= */

async function carregarClientes(force = false) {
    if (cacheClientes && !force) {
        renderProdutos(cacheClientes);
        return;
    }

    try {
        const clientes = await api(`${API_BASE}/clientes/`);
        cacheClientes = clientes;
        renderClientes(clientes);
        atualizarListaClientesAutocomplete();
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar clientes</td></tr>`;
        handleApiError(error);
    }
}

function renderClientes(clientes) {
    const tbody = document.getElementById("clientes-tbody");
    tbody.innerHTML = "";

    clientes.forEach(cliente => {
        tbody.innerHTML += clienteEditando === cliente.num
            ? renderEdicaoClientes(cliente)
            : renderNormalClientes(cliente);
    });
}

function editarCliente(clienteNum) {
    if (clienteEditando) return;

    clienteEditando = clienteNum;
    backupCliente = { ...cacheClientes.find(c => c.num === clienteNum) };

    renderClientes(cacheClientes);
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

    if (!tr.querySelector('[data-f="endereo"]').value) {
        mostrarErro("Informe o endereço do cliente!");
        return;
    }

    const data = {
        nome: tr.querySelector('[data-f="nome"]').value,
        telefone: tr.querySelector('[data-f="telefone"]').value,
        endereco: tr.querySelector('[data-f="endereco"]').value
    };

    try{
        await api(`${API_BASE}/clientes/clientes/${clienteNum}`, "PUT", data);
        
        clienteEditando = null;
        backupCliente = null;

        cacheClientes = null;
        carregarClientes(true);

    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

function cancelarEdicaoCliente() {
    clienteEditando = null;
    backupCliente = null;
    renderClientes(cacheClientes);
}

async function excluirCliente(clienteNum) {
    if (!confirm("Deseja excluir este cliente?")) return;

    await api(`${API_BASE}/clientes/clientes/${clienteNum}`, "DELETE");

    cacheClientes = null;
    carregarClientes(true);
}

function renderNormalClientes(c) {
    return `
        <tr>
            <td>${c.num}</td>
            <td>${c.nome}</td>
            <td>${c.telefone}</td>
            <td>${c.endereco}</td>
            <td>
                <button onclick="editarCliente(${c.num})">✏️</button>
                <button onclick="excluirCliente(${c.num})">🗑️</button>
            </td>
        </tr>
    `;
}

function renderEdicaoClientes(c) {
    return `
        <tr data-editando="true">
            <td>${c.num}</td>
            <td><input value="${c.nome}" data-f="nome"></td>
            <td><input value="${c.telefone}" data-f="telefone"></td>
            <td><input value="${c.endereco}" data-f="endereco"></td>
            <td>
                <button onclick="salvarEdicaoCliente(${c.num})">✅</button>
                <button onclick="cancelarEdicaoCliente()">❌</button>
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

    await api(`${API_BASE}/clientes/clientes`, "POST", data);
    cacheClientes = null;
    limparFormularioCliente();
    carregarClientes(true);
};

/* ================= PRODUTOS ================= */

async function carregarProdutos(force = false) {
    if (cacheProdutos && !force) {
        renderProdutos(cacheProdutos);
        return;
    }

    try {
        const produtos = await api(`${API_BASE}/produtos/`);
        cacheProdutos = produtos;
        renderProdutos(produtos);
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar produtos</td></tr>`;
        handleApiError(error);
    }
}

function renderProdutos(produtos) {
    const tbody = document.getElementById("produtos-tbody");
    tbody.innerHTML = "";

    produtos.forEach(produto => {
        tbody.innerHTML += produtoEditando === produto.num
            ? renderEdicaoProdutos(produto)
            : renderNormalProdutos(produto);
    });
}

function renderNormalProdutos(p) {
    return `
        <tr>
            <td>${p.num}</td>
            <td>${p.nome}</td>
            <td>${p.descricao ?? "-"}</td>
            <td>R$ ${Number(p.valor_compra).toFixed(2)}</td>
            <td>R$ ${Number(p.valor_venda).toFixed(2)}</td>
            <td>${p.categoria ?? "-"}</td>
            <td>
                <button onclick="editarProduto(${p.num})">✏️</button>
                <button onclick="excluirProduto(${p.num})">🗑️</button>
            </td>
        </tr>
    `;
}

function renderEdicaoProdutos(p) {
    return `
        <tr data-editando="true">
            <td>${p.num}</td>
            <td><input value="${p.nome}" data-f="nome"></td>
            <td><input value="${p.descricao ?? ""}" data-f="descricao"></td>
            <td><input type="number" step="0.01" value="${p.valor_compra}" data-f="valor_compra"></td>
            <td><input type="number" step="0.01" value="${p.valor_venda}" data-f="valor_venda"></td>
            <td><input value="${p.categoria ?? ""}" data-f="categoria"></td>
            <td>
                <button onclick="salvarEdicaoProduto(${p.num})">✅</button>
                <button onclick="cancelarEdicaoProduto()">❌</button>
            </td>
        </tr>
    `;
}

function editarProduto(produtoNum) {
    if (produtoEditando) return;

    produtoEditando = produtoNum;
    backupProduto = { ...cacheProdutos.find(p => p.num === produtoNum) };

    renderProdutos(cacheProdutos);
}

async function salvarEdicaoProduto(produtoNum) {
    const tr = document.querySelector('tr[data-editando="true"]');

    if (!tr.querySelector('[data-f="nome"]').value) {
        mostrarErro("Informe o nome do produto!");
        return;
    }

    if (!tr.querySelector('[data-f="valor_compra"]').value) {
        mostrarErro("Informe o valor de compra do produto!");
        return;
    }

    if (Number(tr.querySelector('[data-f="valor_compra"]').value) <= 0) {
        mostrarErro("Valor de compra precisa ser maior que 0!");
        return;
    }

    if (!tr.querySelector('[data-f="valor_venda"]').value) {
        mostrarErro("Informe o valor de venda do produto!");
        return;
    }

    if (Number(tr.querySelector('[data-f="valor_venda"]').value) <= 0) {
        mostrarErro("Valor de venda precisa ser maior que 0!");
        return;
    }

    const data = {
        nome: tr.querySelector('[data-f="nome"]').value,
        descricao: tr.querySelector('[data-f="descricao"]').value || null,
        valor_compra: Number(tr.querySelector('[data-f="valor_compra"]').value),
        valor_venda: Number(tr.querySelector('[data-f="valor_venda"]').value),
        categoria: tr.querySelector('[data-f="categoria"]').value || null
    };

    try{
        await api(`${API_BASE}/produtos/produtos/${produtoNum}`, "PUT", data);

        produtoEditando = null;
        backupProduto = null;
        cacheProdutos = null;

        carregarProdutos(true);
    
    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

function cancelarEdicaoProduto() {
    produtoEditando = null;
    backupProduto = null;
    renderProdutos(cacheProdutos);
}

async function excluirProduto(produtoNum) {
    if (!confirm("Deseja excluir este produto?")) return;

    await api(`${API_BASE}/produtos/produtos/${produtoNum}`, "DELETE");

    cacheProdutos = null;
    carregarProdutos(true);
}

async function salvarProduto() {

    if (!document.getElementById("produto-nome").value) {
        mostrarErro("Informe o nome do produto!");
        return;
    }

    if (!document.getElementById("produto-valor_compra").value) {
        mostrarErro("Informe o valor de compra do produto!");
        return;
    }

    if (document.getElementById("produto-valor_compra").value <= 0) {
        mostrarErro("Valor de compra precisa ser maior que 0!");
        return;
    }

    if (!document.getElementById("produto-valor_venda").value) {
        mostrarErro("Informe o valor de venda do produto!");
        return;
    }


    if (document.getElementById("produto-valor_venda").value <= 0) {
        mostrarErro("Valor de venda precisa ser maior que 0!");
        return;
    }

    const data = {
        nome: document.getElementById("produto-nome").value,
        descricao: document.getElementById("produto-descricao").value || null,
        valor_compra: Number(document.getElementById("produto-valor_compra").value),
        valor_venda: Number(document.getElementById("produto-valor_venda").value),
        categoria: document.getElementById("produto-categoria").value || null
    };

    await api(`${API_BASE}/produtos/produtos`, "POST", data);
    cacheProdutos = null;
    limparFormularioProduto();
    carregarProdutos(true);
};

/* ================= PEDIDOS ================= */

async function carregarPedidos(force = false) {
    if (cachePedidos && !force) {
        renderPedidos(cachePedidos);
        return;
    }

    try {
        const pedidos = await api(`${API_BASE}/pedidos/`);
        cachePedidos = pedidos;
        renderPedidos(pedidos);
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar pedidos</td></tr>`;
        handleApiError(error);
    }
}

function renderPedidos(pedidos) {
    const tbody = document.getElementById("pedidos-tbody");
    tbody.innerHTML = "";

    if (!pedidoEditando) {
        pedidoAbertoAtual = null;
        detalhesAbertosAtual = null;
    }

    pedidos.forEach(pedido => {

        const trPedido = document.createElement("tr");
        trPedido.classList.add("pedido-row");
        trPedido.style.cursor = "pointer";

        if (pedidoEditando && pedidoEditando == pedido.num) {
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

        trPedido.addEventListener("click", async () => {

            if (pedidoEditando && pedidoEditando === pedido.num) {
                return;
            }

            if (pedidoAbertoAtual === trPedido) {
                trDetalhes.classList.toggle("hidden");
                atualizarIcone(trPedido, !trDetalhes.classList.contains("hidden"));
                return;
            }

            if (detalhesAbertosAtual) {
                detalhesAbertosAtual.classList.add("hidden");
                atualizarIcone(pedidoAbertoAtual, false);
            }

            trDetalhes.classList.remove("hidden");
            atualizarIcone(trPedido, true);

            pedidoAbertoAtual = trPedido;
            detalhesAbertosAtual = trDetalhes;

            if (cacheItensPedido[pedido.num]) {
                renderItensPedido(trDetalhes, cacheItensPedido[pedido.num], pedido.num);
                return;
            }
            else
                try {
                    const itens = await api(`${API_BASE}/pedidos/${pedido.num}`);
                    cacheItensPedido[pedido.num] = itens;
                    renderItensPedido(trDetalhes, cacheItensPedido[pedido.num], pedido.num);
                } catch (error) {
                    trDetalhes.querySelector(".pedido-detalhes-container").innerHTML =
                        "<p>Erro ao carregar itens</p>";
                    console.error(error);
                }
        });

        tbody.appendChild(trPedido);
        tbody.appendChild(trDetalhes);
    });
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
            <button onclick="event.stopPropagation(); editarPedido(${pedido.num})">✏️</button>
            <button onclick="event.stopPropagation(); excluirPedido(${pedido.num})">🗑️</button>
        </td>
    `;
}

function renderEdicaoPedidos(pedido) {
    return `
        <td>${pedido.num}</td>

        <td>
            <select data-f="num_cliente">
                ${cacheClientes.map(c =>
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
                ${cacheFormasPagamento.map(f =>
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
            <button onclick="salvarEdicaoPedido(${pedido.num})">✅</button>
            <button onclick="cancelarEdicaoPedido()">❌</button>
        </td>
    `;
}

async function editarPedido(pedidoNum) {
    if (pedidoEditando) return;

    if (!cacheClientes) {
        await carregarClientes(true);
    }

    pedidoEditando = pedidoNum;
    backupPedido = { ...cachePedidos.find(p => p.num === pedidoNum) };

    renderPedidos(cachePedidos);
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

        pedidoEditando = null;
        backupPedido = null;

        cachePedidos = null;
        carregarPedidos(true);

    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

function cancelarEdicaoPedido() {
    pedidoEditando = null;
    backupPedido = null;
    renderPedidos(cachePedidos);
}


async function excluirPedido(pedidoNum) {
    if (!confirm("Deseja excluir este pedido?")) return;

    await api(`${API_BASE}/pedidos/pedidos/${pedidoNum}`, "DELETE");

    cachePedidos = null;
    delete cacheItensPedido[pedidoNum];

    carregarPedidos(true);
}

/* ================= ITENS PEDIDOS ================= */

function renderItensPedido(trDetalhes, itens, pedidoNum) {
    const container = trDetalhes.querySelector(".pedido-detalhes-container");

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
        itemEditando &&
            itemEditando.pedidoNum === pedidoNum &&
            itemEditando.itemNum === item.num
            ? renderEdicaoItensPedido(item, pedidoNum)
            : renderNormalItensPedido(item, pedidoNum)
    ).join("")}
            </tbody>
        </table>
    `;
}

function renderNormalItensPedido(item, pedidoNum) {
    return `
        <tr>
            <td>${produtosCache.find(p => p.num === item.num_produto)?.nome ?? "Produto removido"}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${Number(item.valor_unitario).toFixed(2)}</td>
            <td>R$ ${(item.quantidade * item.valor_unitario).toFixed(2)}</td>
            <td>
                <button onclick="event.stopPropagation(); editarItemPedido(${pedidoNum}, ${item.num})">✏️</button>
                <button onclick="event.stopPropagation(); excluirItemPedido(${pedidoNum}, ${item.num})">🗑️</button>
            </td>
        </tr>
    `;
}

function renderEdicaoItensPedido(item, pedidoNum) {
    return `
        <tr data-editando="true">
            <td>
                <select data-f="num_produto">
                    ${produtosCache.map(p =>
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
                <button onclick="salvarEdicaoItemPedido(${pedidoNum}, ${item.num})">✅</button>
                <button onclick="cancelarEdicaoItemPedido()">❌</button>
            </td>
        </tr>
    `;
}


function editarItemPedido(pedidoNum, itemNum) {
    if (itemEditando) return;

    itemEditando = { pedidoNum, itemNum };

    backupItem = {
        ...cacheItensPedido[pedidoNum]
            .find(i => i.num === itemNum)
    };

    renderItensPedido(detalhesAbertosAtual, cacheItensPedido[pedidoNum], pedidoNum);

    const trEditando = detalhesAbertosAtual.querySelector('tr[data-editando="true"]');
    if (trEditando) {
        ativarEventosEdicao(trEditando);
    }
}

async function salvarEdicaoItemPedido(pedidoNum, itemNum) {

    const tr = detalhesAbertosAtual.querySelector('tr[data-editando="true"]');

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

    await api(`${API_BASE}/pedidos/pedidos/${pedidoNum}/${itemNum}`, "PUT", data);

    itemEditando = null;
    backupItem = null;

    delete cacheItensPedido[pedidoNum];

    const itensAtualizados = await api(`${API_BASE}/pedidos/${pedidoNum}`);
    cacheItensPedido[pedidoNum] = itensAtualizados;

    renderItensPedido(detalhesAbertosAtual, itensAtualizados, pedidoNum);
    carregarPedidos(true);
}


function cancelarEdicaoItemPedido() {
    const { pedidoNum } = itemEditando;

    itemEditando = null;
    backupItem = null;

    renderItensPedido(detalhesAbertosAtual, cacheItensPedido[pedidoNum], pedidoNum);

    const trEditando = detalhesAbertosAtual.querySelector('tr[data-editando="true"]');
    if (trEditando) {
        eventosEdicaoItemPedido(trEditando);
    }
}

async function excluirItemPedido(pedidoNum, itemNum) {
    if (!confirm("Deseja remover este item?")) return;

    await api(`${API_BASE}/pedidos/pedidos/${pedidoNum}/${itemNum}`, "DELETE");

    cachePedidos = null;
    delete cacheItensPedido[pedidoNum];

    carregarPedidos(true);
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
    tbody.innerHTML = "";

    itensPedido.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <select class="select-produto" data-i="${index}" data-f="num_produto">
                    <option value="">Selecione</option>
                    ${produtosCache.map(p =>
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
            itensPedido[i][f] =
                f === "num_produto"
                    ? e.target.value
                    : Number(e.target.value);

            atualizarSubtotalItem(i);
            calcularTotalPedido();
        });
    });

    tbody.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            itensPedido.splice(btn.dataset.r, 1);
            renderItensNovoPedido();
        });
    });

    tbody.querySelectorAll(".select-produto").forEach(select => {
        select.addEventListener("change", e => {
            const index = e.target.dataset.i;
            const produto = produtosCache.find(p => p.num == e.target.value);

            if (produto) {
            itensPedido[index].num_produto = produto.num;
            itensPedido[index].valor_unitario = Number(produto.valor_venda);
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

    if (itensPedido.length === 0) {
        mostrarErro("Adicione pelo menos um item!");
        return;
    }

    for (const item of itensPedido) {
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
        itens: itensPedido.map(i => ({
            num_produto: i.num_produto,
            quantidade: i.quantidade,
            valor_unitario: i.valor_unitario
        })),
        forma_pagamento: document.getElementById("pedido-forma_pagamento").value,
        pago: document.getElementById("pedido-pago").checked,
    };

    try{
        await api(`${API_BASE}/pedidos/pedidos`, "POST", data);

        cachePedidos = null;

        renderItensNovoPedido();
        limparFormularioPedido();
        carregarPedidos(true);
    } catch (error){
        mostrarErro(error || "Nao foi possivel salvar pedido!")
    }
};

function atualizarListaClientesAutocomplete() {
    const select = document.getElementById("pedido-cliente");
    select.innerHTML = `<option value="">Selecione</option>`;

    cacheClientes.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.num;
        opt.textContent = c.nome;
        select.appendChild(opt);
    });
}

function atualizarFormaPagamentoAutocomplete() {
    const select = document.getElementById("pedido-forma_pagamento");
    select.innerHTML = `<option value="">Selecione</option>`;

    cacheFormasPagamento.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
    });
}

/* ================= CALCULOS DO PEDIDO FORM ================= */

function calcularTotalPedido() {
    const total = itensPedido.reduce((acc, item) => {
        return acc + (item.quantidade * item.valor_unitario);
    }, 0);

    document.getElementById("pedido-total").textContent =
        `R$ ${total.toFixed(2)}`;
}

function atualizarSubtotalItem(index) {
    const item = itensPedido[index];
    const subtotal = item.quantidade * item.valor_unitario;

    const cell = document.querySelector(
        `[data-subtotal="${index}"]`
    );

    if (cell) {
        cell.textContent = `R$ ${subtotal.toFixed(2)}`;
    }
}

function atualizarSubtotalEdicao(tr) {
    const qtd = Number(
        tr.querySelector('[data-f="quantidade"]').value
    ) || 0;

    const valor = Number(
        tr.querySelector('[data-f="valor_unitario"]').value
    ) || 0;

    const subtotal = qtd * valor;

    const cell = tr.querySelector('[data-subtotal]');

    if (cell) {
        cell.textContent = `R$ ${subtotal.toFixed(2)}`;
    }
}

/* ================= FORMULARIOS ================= */

function abrirFormulario(tipo) {
    document.getElementById(`form-${tipo}`).classList.remove("hidden");

    if (tipo === "pedido") {
        if (!cacheClientes) {
            carregarClientes(true).then(atualizarListaClientesAutocomplete);
        } else {
            atualizarListaClientesAutocomplete();
        }
        atualizarFormaPagamentoAutocomplete();
    }
}

function fecharFormulario(tipo) {
    document.getElementById(`form-${tipo}`).classList.add("hidden");
    if (tipo === "pedido") {
        limparFormularioPedido()
    } else if (tipo === "cliente") {
        limparFormularioCliente()
    } else if (tipo === "produto") {
        limparFormularioProduto()
    }
}

function limparFormularioPedido() {
    document.getElementById("pedido-cliente").value = "";

    itensPedido = [];

    document.getElementById("itens-pedido-tbody").innerHTML = "";
    document.getElementById("pedido-total").textContent = "R$ 0,00";
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

/* ================= USUARIOS ================= */

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

/* ================= GENERICAS ================= */

function atualizarIcone(tr, aberto) {
    const icone = tr.querySelector(".icone-toggle");
    icone.textContent = aberto ? "🔼" : "🔽";
}

function handleApiError(error) {
    if (error.status === 401) {
        mostrarErro("Sessão expirada. Faça login novamente.");
        localStorage.clear();

        setTimeout(() => {
            logout();
        }, 1500);

        return;
    }

    mostrarErro(error.message || "Erro inesperado");
}

function mostrarErro(mensagem) {
    const toast = document.getElementById("toast");
    toast.textContent = mensagem;
    toast.classList.remove("hidden");

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 4000);
}