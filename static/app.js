/* ================= CONFIG ================= */

const API_BASE = "http://localhost:8000";

let itensPedido = [];
let produtosCache = [];
let cachePedidos = null;
let cacheClientes = null;
let cacheProdutos = null;

/* ================= HELPERS ================= */

async function api(url, method = "GET", body = null) {
    const options = {
        method,
        headers: { "Content-Type": "application/json" }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_BASE + url, options);

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    return response.json();
}

/* ================= TABS ================= */

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", async () => {

        // troca visual
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");

        // carrega dados conforme a aba
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
    const res = await fetch(`${API_BASE}/produtos/`);
    produtosCache = await res.json();
}

document.addEventListener("DOMContentLoaded", async () => {
    await carregarProdutosCache();

    document.getElementById("btn-add-item")?.addEventListener("click", () => {
        itensPedido.push({
            produto_nome: "",
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
        const response = await fetch(`${API_BASE}/clientes/`);
        if (!response.ok) throw new Error("Erro ao buscar clientes");
        const clientes = await response.json();
        cacheClientes = clientes;
        renderizarClientes(clientes);
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar clientes</td></tr>`;
    }
}

async function renderizarClientes(clientes) {
    const tbody = document.getElementById("clientes-tbody");
    tbody.innerHTML = "";

    clientes.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.num}</td>
                <td>${c.nome}</td>
                <td>${c.idade ?? "-"}</td>
                <td>${c.telefone}</td>
                <td>${c.email ?? "-"}</td>
                <td>
                    <button>✏️</button>
                    <button>🗑️</button>
                </td>
            </tr>
        `;
    });
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

    await api("/clientes/clientes", "POST", data);
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
        const response = await fetch(`${API_BASE}/produtos/`);
        if (!response.ok) throw new Error("Erro ao buscar produtos");
        const produtos = await response.json();
        cacheProdutos = produtos;
        renderizarProdutos(produtos);
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar produtos</td></tr>`;
    }
}

async function renderizarProdutos(produtos) {
    const tbody = document.getElementById("produtos-tbody");
    tbody.innerHTML = "";

    produtos.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.num}</td>
                <td>${p.nome}</td>
                <td>${p.descricao ?? "-"}</td>
                <td>R$ ${Number(p.valor).toFixed(2)}</td>
                <td>${p.categoria ?? "-"}</td>
                <td>
                    <button>✏️</button>
                    <button>🗑️</button>
                </td>
            </tr>
        `;
    });
}

async function salvarProduto()  {

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

    await api("/produtos/produtos", "POST", data);
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
        const response = await fetch(`${API_BASE}/pedidos/`);
        if (!response.ok) throw new Error("Erro ao buscar pedidos");
        const pedidos = await response.json();
        cachePedidos = pedidos;
        renderizarPedidos(pedidos);
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar pedidos</td></tr>`;
    }
}

async function renderizarPedidos(pedidos) {
    const tbody = document.getElementById("pedidos-tbody");
    tbody.innerHTML = "";

        pedidos.forEach(pedido => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${pedido.num}</td>
            <td>${pedido.cliente_nome}</td>
            <td>${new Date(pedido.data).toLocaleDateString()}</td>
            <td>R$ ${Number(pedido.valor).toFixed(2)}</td>
            <td>
                <button>✏️</button>
                <button>🗑️</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/* ================= PEDIDO FORM ================= */

function renderizarItens() {
    const tbody = document.getElementById("itens-pedido-tbody");
    tbody.innerHTML = "";

    itensPedido.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <select data-i="${index}" data-f="produto_nome" class="select-produto">
                    <option value="">Selecione</option>
                    ${produtosCache.map(p =>
                        `<option value="${p.nome}" ${p.nome === item.produto_nome ? "selected" : ""}>
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
                f === "produto_nome"
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
            const nomeProduto = e.target.value;

            const produto = produtosCache.find(p => p.nome === nomeProduto);

            if (produto) {
                itensPedido[index].produto_nome = produto.nome;
                itensPedido[index].valor_unitario = Number(produto.valor);
                renderizarItens();
            }
        });
    });
    calcularTotalPedido();
}

async function salvarPedido() {

    if (!document.getElementById("pedido-cliente-nome").value) {
        alert("Informe o nome do cliente");
        return;
    }

    if (itensPedido.length === 0) {
        alert("Adicione ao menos um item");
        return;
    }

    for (const item of itensPedido) {
        if (!item.produto_nome || item.quantidade <= 0 || item.valor_unitario <= 0) {
            alert("Preencha corretamente todos os itens");
            return;
        }
    }

    const data = {
        cliente_nome: document.getElementById("pedido-cliente-nome").value,
        itens: itensPedido
    };

    await api("/pedidos/pedidos", "POST", data);

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

/* ================= FORMULARIOS ================= */

function abrirFormulario(tipo) {
    document.getElementById(`form-${tipo}`).classList.remove("hidden");
}

function fecharFormulario(tipo) {
    document.getElementById(`form-${tipo}`).classList.add("hidden");
    if (tipo === "pedido"){
        limparFormularioPedido()
    } else if (tipo === "cliente"){
        limparFormularioCliente()
    } else if (tipo === "produto"){
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

