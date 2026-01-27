/* ================= CONFIG ================= */

let itensPedido = [];
let produtosCache = [];
let cachePedidos = null;
let cacheClientes = null;
let cacheProdutos = null;
let cacheItensPedido = {};
let pedidoAbertoAtual = null;
let detalhesAbertosAtual = null;
let itemEditando = null;
let backupItem = null;
let clienteEditando = null;
let backupCliente = null;
let produtoEditando = null;
let backupProduto = null;

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

    await carregarUsuarioLogado();

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
        renderizarItens();
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
});


/* ================= CLIENTES ================= */

async function carregarClientes(force = false) {
    if (cacheClientes && !force) {
        renderizarProdutos(cacheClientes);
        return;
    }

    try {
        const clientes = await api(`${API_BASE}/clientes/`);
        cacheClientes = clientes;
        renderizarClientes(clientes);
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar clientes</td></tr>`;
    }
}

function renderizarClientes(clientes) {
    const tbody = document.getElementById("clientes-tbody");
    tbody.innerHTML = "";

    clientes.forEach(cliente => {
        tbody.innerHTML += clienteEditando === cliente.num
            ? renderLinhaClienteEdicao(cliente)
            : renderLinhaClienteNormal(cliente);
    });
}

function editarCliente(clienteNum) {
    if (clienteEditando) return;

    clienteEditando = clienteNum;
    backupCliente = { ...cacheClientes.find(c => c.num === clienteNum) };

    renderizarClientes(cacheClientes);
}

async function salvarEdicaoCliente(clienteNum) {
    const tr = document.querySelector('tr[data-editando="true"]');

    const data = {
        nome: tr.querySelector('[data-f="nome"]').value,
        idade: Number(tr.querySelector('[data-f="idade"]').value) || null,
        telefone: tr.querySelector('[data-f="telefone"]').value,
        email: tr.querySelector('[data-f="email"]').value || null
    };

    await api(`${API_BASE}/clientes/clientes/${clienteNum}`, "PUT", data);

    clienteEditando = null;
    backupCliente = null;

    cacheClientes = null;
    carregarClientes(true);
}

function cancelarEdicaoCliente() {
    clienteEditando = null;
    backupCliente = null;
    renderizarClientes(cacheClientes);
}

async function excluirCliente(clienteNum) {
    if (!confirm("Deseja excluir este cliente?")) return;

    await api(`${API_BASE}/clientes/clientes/${clienteNum}`, "DELETE");

    cacheClientes = null;
    carregarClientes(true);
}

function renderLinhaClienteNormal(c) {
    return `
        <tr>
            <td>${c.num}</td>
            <td>${c.nome}</td>
            <td>${c.idade ?? "-"}</td>
            <td>${c.telefone}</td>
            <td>${c.email ?? "-"}</td>
            <td>
                <button onclick="editarCliente(${c.num})">✏️</button>
                <button onclick="excluirCliente(${c.num})">🗑️</button>
            </td>
        </tr>
    `;
}

function renderLinhaClienteEdicao(c) {
    return `
        <tr data-editando="true">
            <td>${c.num}</td>
            <td><input value="${c.nome}" data-f="nome"></td>
            <td><input type="number" value="${c.idade ?? ""}" data-f="idade"></td>
            <td><input value="${c.telefone}" data-f="telefone"></td>
            <td><input value="${c.email ?? ""}" data-f="email"></td>
            <td>
                <button onclick="salvarEdicaoCliente(${c.num})">✅</button>
                <button onclick="cancelarEdicaoCliente()">❌</button>
            </td>
        </tr>
    `;
}

async function salvarCliente() {

    if (!document.getElementById("cliente-nome").value) {
        alert("Informe o nome do cliente!");
        return;
    }

    if (!document.getElementById("cliente-telefone").value) {
        alert("Informe o telefone do cliente!");
        return;
    }

    const data = {
        nome: document.getElementById("cliente-nome").value,
        idade: Number(document.getElementById("cliente-idade").value) || null,
        telefone: document.getElementById("cliente-telefone").value,
        email: document.getElementById("cliente-email").value || null
    };

    await api(`${API_BASE}/clientes/clientes`, "POST", data);
    cacheClientes = null;
    limparFormularioCliente();
    carregarClientes(true);
};

/* ================= PRODUTOS ================= */

async function carregarProdutos(force = false) {
    if (cacheProdutos && !force) {
        renderizarProdutos(cacheProdutos);
        return;
    }

    try {
        const produtos = await api(`${API_BASE}/produtos/`);
        cacheProdutos = produtos;
        renderizarProdutos(produtos);
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar produtos</td></tr>`;
    }
}

function renderizarProdutos(produtos) {
    const tbody = document.getElementById("produtos-tbody");
    tbody.innerHTML = "";

    produtos.forEach(produto => {
        tbody.innerHTML += produtoEditando === produto.num
            ? renderLinhaProdutoEdicao(produto)
            : renderLinhaProdutoNormal(produto);
    });
}

function renderLinhaProdutoNormal(p) {
    return `
        <tr>
            <td>${p.num}</td>
            <td>${p.nome}</td>
            <td>${p.descricao ?? "-"}</td>
            <td>R$ ${Number(p.valor).toFixed(2)}</td>
            <td>${p.categoria ?? "-"}</td>
            <td>
                <button onclick="editarProduto(${p.num})">✏️</button>
                <button onclick="excluirProduto(${p.num})">🗑️</button>
            </td>
        </tr>
    `;
}

function renderLinhaProdutoEdicao(p) {
    return `
        <tr data-editando="true">
            <td>${p.num}</td>
            <td><input value="${p.nome}" data-f="nome"></td>
            <td><input value="${p.descricao ?? ""}" data-f="descricao"></td>
            <td><input type="number" step="0.01" value="${p.valor}" data-f="valor"></td>
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

    renderizarProdutos(cacheProdutos);
}

async function salvarEdicaoProduto(produtoNum) {
    const tr = document.querySelector('tr[data-editando="true"]');

    const data = {
        nome: tr.querySelector('[data-f="nome"]').value,
        descricao: tr.querySelector('[data-f="descricao"]').value || null,
        valor: Number(tr.querySelector('[data-f="valor"]').value),
        categoria: tr.querySelector('[data-f="categoria"]').value || null
    };

    await api(`${API_BASE}/produtos/produtos/${produtoNum}`, "PUT", data);

    produtoEditando = null;
    backupProduto = null;

    cacheProdutos = null;
    carregarProdutos(true);
}

function cancelarEdicaoProduto() {
    produtoEditando = null;
    backupProduto = null;
    renderizarProdutos(cacheProdutos);
}

async function excluirProduto(produtoNum) {
    if (!confirm("Deseja excluir este produto?")) return;

    await api(`${API_BASE}/produtos/produtos/${produtoNum}`, "DELETE");

    cacheProdutos = null;
    carregarProdutos(true);
}

async function salvarProduto() {

    if (!document.getElementById("produto-nome").value) {
        alert("Informe o nome do produto!");
        return;
    }

    if (!document.getElementById("produto-valor").value) {
        alert("Informe o valor do produto!");
        return;
    }

    if (document.getElementById("produto-valor").value <= 0) {
        alert("Valor precisa ser maior que 0!");
        return;
    }

    const data = {
        nome: document.getElementById("produto-nome").value,
        descricao: document.getElementById("produto-descricao").value || null,
        valor: Number(document.getElementById("produto-valor").value),
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
        renderizarPedidos(cachePedidos);
        return;
    }

    try {
        const pedidos = await api(`${API_BASE}/pedidos/`);
        cachePedidos = pedidos;
        renderizarPedidos(pedidos);
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar pedidos</td></tr>`;
    }
}

function renderizarPedidos(pedidos) {
    const tbody = document.getElementById("pedidos-tbody");
    tbody.innerHTML = "";

    pedidoAbertoAtual = null;
    detalhesAbertosAtual = null;

    pedidos.forEach(pedido => {

        const trPedido = document.createElement("tr");
        trPedido.classList.add("pedido-row");
        trPedido.style.cursor = "pointer";

        trPedido.innerHTML = `
            <td>${pedido.num}</td>
            <td>${pedido.cliente_nome}</td>
            <td>${new Date(pedido.data).toLocaleDateString("pt-BR")}</td>
            <td>R$ ${Number(pedido.valor).toFixed(2)}</td>
            <td>
                <button onclick="event.stopPropagation(); excluirPedido(${pedido.num})">🗑️</button>
            </td>
            <td class="icone-toggle">🔽</td>
        `;

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
                renderizarItensPedido(trDetalhes, cacheItensPedido[pedido.num], pedido.num);
                return;
            }
            else
                try {
                    const itens = await api(`${API_BASE}/pedidos/${pedido.num}`);
                    cacheItensPedido[pedido.num] = itens;
                    renderizarItensPedido(trDetalhes, cacheItensPedido[pedido.num], pedido.num);
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

async function excluirPedido(pedidoNum) {
    if (!confirm("Deseja excluir este pedido?")) return;

    await api(`${API_BASE}/pedidos/pedidos/${pedidoNum}`, "DELETE");

    cachePedidos = null;
    delete cacheItensPedido[pedidoNum];

    carregarPedidos(true);
}

/* ================= ITENS PEDIDOS ================= */

function renderizarItensPedido(trDetalhes, itens, pedidoNum) {
    const container = trDetalhes.querySelector(".pedido-detalhes-container");

    container.innerHTML = `
        <table class="data-table" style="width: 90%">
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
            ? renderLinhaEdicao(item, pedidoNum)
            : renderLinhaNormal(item, pedidoNum)
    ).join("")}
            </tbody>
        </table>
    `;
}

function renderLinhaNormal(item, pedidoNum) {
    return `
        <tr>
            <td>${produtosCache.find(p => p.num === item.num_produto)?.nome ?? "Produto removido"}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${Number(item.valor_unitario).toFixed(2)}</td>
            <td>R$ ${(item.quantidade * item.valor_unitario).toFixed(2)}</td>
            <td>
                <button onclick="event.stopPropagation(); editarItem(${pedidoNum}, ${item.num})">✏️</button>
                <button onclick="event.stopPropagation(); excluirItem(${pedidoNum}, ${item.num})">🗑️</button>
            </td>
        </tr>
    `;
}

function renderLinhaEdicao(item, pedidoNum) {
    return `
        <tr data-editando="true">
            <td>
                <select data-f="num_produto" class="select-produto">
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
                <button onclick="salvarEdicaoItem(${pedidoNum}, ${item.num})">✅</button>
                <button onclick="cancelarEdicao()">❌</button>
            </td>
        </tr>
    `;
}


function editarItem(pedidoNum, itemNum) {
    if (itemEditando) return;

    itemEditando = { pedidoNum, itemNum };

    backupItem = {
        ...cacheItensPedido[pedidoNum]
            .find(i => i.num === itemNum)
    };

    renderizarItensPedido(detalhesAbertosAtual, cacheItensPedido[pedidoNum], pedidoNum);

    const trEditando = detalhesAbertosAtual.querySelector('tr[data-editando="true"]');
    if (trEditando) {
        ativarEventosEdicao(trEditando);
    }
}

async function salvarEdicaoItem(pedidoNum, itemNum) {
    console.log("Funcionando");
    const tr = detalhesAbertosAtual.querySelector('tr[data-editando="true"]');

    if (!tr) {
        alert("Linha em edição não encontrada");
        return;
    }

    const produtoSelecionado =
        tr.querySelector('[data-f="num_produto"]').value;

    const quantidade = Number(
        tr.querySelector('[data-f="quantidade"]').value
    );

    const valor_unitario = Number(
        tr.querySelector('[data-f="valor_unitario"]').value
    );

    if (!produtoSelecionado || quantidade <= 0 || valor_unitario <= 0) {
        alert("Valores inválidos");
        return;
    }

    await api(`${API_BASE}/pedidos/pedidos/${pedidoNum}/${itemNum}`, "PUT", {
        item: {
            num_produto: produtoSelecionado,
            quantidade: quantidade,
            valor_unitario: valor_unitario
        }
    });

    itemEditando = null;
    backupItem = null;

    delete cacheItensPedido[pedidoNum];

    const itensAtualizados = await api(`${API_BASE}/pedidos/${pedidoNum}`);
    cacheItensPedido[pedidoNum] = itensAtualizados;

    renderizarItensPedido(detalhesAbertosAtual, itensAtualizados, pedidoNum);
    carregarPedidos(true);
}


function cancelarEdicao() {
    const { pedidoNum } = itemEditando;

    itemEditando = null;
    backupItem = null;

    renderizarItensPedido(detalhesAbertosAtual, cacheItensPedido[pedidoNum], pedidoNum);

    const trEditando = detalhesAbertosAtual.querySelector('tr[data-editando="true"]');
    if (trEditando) {
        ativarEventosEdicao(trEditando);
    }
}

async function excluirItem(pedidoNum, itemNum) {
    if (!confirm("Deseja remover este item?")) return;

    await api(`${API_BASE}/pedidos/pedidos/${pedidoNum}/${itemNum}`, "DELETE");

    cachePedidos = null;
    delete cacheItensPedido[pedidoNum];

    carregarPedidos(true);
}

function ativarEventosEdicao(tr) {
    tr.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", () => {
            atualizarSubtotalEdicao(tr);
        });
    });

    atualizarSubtotalEdicao(tr);
}

/* ================= NOVO PEDIDO FORMULARIO ================= */

function renderizarItens() {
    const tbody = document.getElementById("itens-pedido-tbody");
    tbody.innerHTML = "";

    itensPedido.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <select data-i="${index}" data-f="num_produto" class="select-produto">
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
            renderizarItens();
        });
    });

    tbody.querySelectorAll(".select-produto").forEach(select => {
        select.addEventListener("change", e => {
            const index = e.target.dataset.i;
            const produto = produtosCache.find(p => p.num == e.target.value);

            if (produto) {
            itensPedido[index].num_produto = produto.num;
            itensPedido[index].valor_unitario = Number(produto.valor);
            renderizarItens();
            }
        });
    });
    calcularTotalPedido();
}

async function salvarPedido() {

    if (!document.getElementById("pedido-cliente-nome").value) {
        alert("Informe o nome do cliente!");
        return;
    }

    if (itensPedido.length === 0) {
        alert("Adicione pelo menos um item!");
        return;
    }

    for (const item of itensPedido) {
        if (!item.num_produto || item.quantidade <= 0 || item.valor_unitario <= 0) {
            alert("Preencha todos os itens corretamente!");
            return;
        }
    }

    const data = {
        cliente_nome: document.getElementById("pedido-cliente-nome").value,
        itens: itensPedido.map(i => ({
            num_produto: i.num_produto,
            quantidade: i.quantidade,
            valor_unitario: i.valor_unitario
        }))
    };

    await api(`${API_BASE}/pedidos/pedidos`, "POST", data);

    renderizarItens();
    cachePedidos = null;
    limparFormularioPedido();
    carregarPedidos(true);
};

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
    document.getElementById("pedido-cliente-nome").value = "";

    itensPedido = [];

    document.getElementById("itens-pedido-tbody").innerHTML = "";
    document.getElementById("pedido-total").textContent = "R$ 0,00";
}

function limparFormularioCliente() {
    document.getElementById("cliente-nome").value = "";
    document.getElementById("cliente-idade").value = "";
    document.getElementById("cliente-telefone").value = "";
    document.getElementById("cliente-email").value = "";
}

function limparFormularioProduto() {
    document.getElementById("produto-nome").value = "";
    document.getElementById("produto-descricao").value = "";
    document.getElementById("produto-valor").value = "";
    document.getElementById("produto-categoria").value = "";
}

/* ================= USUARIOS ================= */

async function carregarUsuarioLogado() {
    try {
        const usuario = await api(`${API_BASE}/usuarios/me`);

        document.getElementById("user-email").textContent = usuario.email;
        document.getElementById("user-btn").textContent =
            `${usuario.email} ▾`;

    } catch (err) {
        console.error("Erro ao carregar usuário", err);
    }
}

/* ================= GENERICAS ================= */

function atualizarIcone(tr, aberto) {
    const icone = tr.querySelector(".icone-toggle");
    icone.textContent = aberto ? "🔼" : "🔽";
}