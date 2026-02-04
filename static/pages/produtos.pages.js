import { api } from "../core/api.js";
import { API_BASE } from "../core/config.js";
import { mostrarErro, mostrarSucesso, handleApiError } from "../core/feedback.js";
import { abrirFormulario, fecharFormulario, limparFormulario} from "../core/forms.js";
import { state } from "../core/state.js";

let eventosInicializados = false;

async function carregarProdutos(force = false) {

    if (state.produtos.cache.length && !force) {
        renderProdutos(state.produtos.cache);
        return;
    }

    try {
        const produtos = await api(`${API_BASE}/produtos/`);
        state.produtos.cache = produtos;
        renderProdutos(produtos);
    } catch (error) {
        console.error(error);
        const tbody = document.getElementById("produtos-tbody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7">Erro ao carregar produtos</td></tr>`;
        }
        handleApiError(error);
    }
}

function renderProdutos(produtos) {

    const tbody = document.getElementById("produtos-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    produtos.forEach(produto => {
        tbody.innerHTML += state.produtos.ui.editando === produto.num
            ? renderEdicaoProdutos(produto)
            : renderNormalProdutos(produto);
    });
}

function renderNormalProdutos(p) {

    return `
        <tr data-id="${p.num}">
            <td>${p.num}</td>
            <td>${p.nome}</td>
            <td>${p.descricao ?? "-"}</td>
            <td>R$ ${Number(p.valor_compra).toFixed(2)}</td>
            <td>R$ ${Number(p.valor_venda).toFixed(2)}</td>
            <td>${p.categoria ?? "-"}</td>
            <td>
                <button title="Editar" data-action="editar">✏️</button>
                <button title="Excluir" data-action="excluir">🗑️</button>
            </td>
        </tr>
    `;
}

function renderEdicaoProdutos(p) {

    return `
        <tr data-id="${p.num}" data-editando="true">
            <td>${p.num}</td>
            <td><input value="${p.nome}" data-f="nome"></td>
            <td><input value="${p.descricao ?? ""}" data-f="descricao"></td>
            <td><input type="number" step="0.01" value="${p.valor_compra}" data-f="valor_compra"></td>
            <td><input type="number" step="0.01" value="${p.valor_venda}" data-f="valor_venda"></td>
            <td><input value="${p.categoria ?? ""}" data-f="categoria"></td>
            <td>
                <button title="Salvar" data-action="salvar">✅</button>
                <button title="Cancelar" data-action="cancelar">❌</button>
            </td>
        </tr>
    `;
}

function editarProduto(produtoNum) {

    if (state.produtos.ui.editando !== null) return;

    state.produtos.ui.editando = produtoNum;

    renderProdutos(state.produtos.cache);
}

async function salvarEdicaoProduto(produtoNum) {

    const tr = document.querySelector('tr[data-editando="true"]');
    if (!tr) {
        mostrarErro("Nenhum produto em edição.");
        return;
    }

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

    try {
        await api(`${API_BASE}/produtos/produtos/${produtoNum}`, "PUT", data);

        state.produtos.ui.editando = null;
        state.produtos.cache = [];

        carregarProdutos(true);

        mostrarSucesso("Produto atualizado com sucesso!");
    
    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
}

function cancelarEdicaoProduto() {

    state.produtos.ui.editando = null;
    renderProdutos(state.produtos.cache);
}

async function excluirProduto(produtoNum) {
    
    if (!confirm("Deseja excluir este produto?")) return;

    try {
        await api(`${API_BASE}/produtos/produtos/${produtoNum}`, "DELETE");

        state.produtos.cache = [];
        state.estoque.cache = [];
        carregarProdutos(true);

        mostrarSucesso("Produto excluido com sucesso!");
    
    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
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

    try {
        await api(`${API_BASE}/produtos/produtos`, "POST", data);
        state.produtos.cache = [];
        state.estoque.cache = [];
        limparFormulario("produto");
        carregarProdutos(true);

        mostrarSucesso("Produto criado com sucesso!");

    } catch (error) {
        console.error(error);
        handleApiError(error);
    }
};

function initProdutosEventos() {

    const section = document.getElementById("produtos");
    if (!section) return;

    section.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");

        const action = btn.dataset.action;
        if (!action) return;

        switch (action) {

            case "novo-produto":
                abrirFormulario("produto");
                break;

            case "cancelar-produto":
                fecharFormulario("produto");
                break;

            case "salvar-produto":
                salvarProduto();
                break;

            case "recarregar-produto":
                carregarProdutos(true);
                break;
        }
    });

    const tbody = document.getElementById("produtos-tbody");
    if (!tbody) return;

    tbody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const tr = btn.closest("tr");
        const produtoId = Number(tr.dataset.id);
        const action = btn.dataset.action;

        if (!action) return;

        switch (action) {
            case "editar":
                editarProduto(produtoId);
                break;

            case "excluir":
                excluirProduto(produtoId);
                break;

            case "salvar":
                salvarEdicaoProduto(produtoId);
                break;

            case "cancelar":
                cancelarEdicaoProduto();
                break;
        }
    });
}

function initProdutos() {
    carregarProdutos();

    if (!eventosInicializados) {
        initProdutosEventos();
        eventosInicializados = true;
    }
}

export { initProdutos };