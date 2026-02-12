import { verificarAuth } from "../core/guard.js";
import { initUserMenu } from "../core/ui.js";
import { initTabs, ativarAbaInicial } from "./tabs.js";

import { initPedidos } from "../pages/pedidos.pages.js";
import { initClientes } from "../pages/clientes.pages.js";
import { initProdutos } from "../pages/produtos.pages.js";
import { initEstoque } from "../pages/estoque.pages.js";

async function bootstrap() {
    if (!verificarAuth()) return;

    // UI global
    initUserMenu();

    // páginas
    initPedidos?.();
    initClientes?.();
    initProdutos?.();
    initEstoque?.();

    // abas
    initTabs();
    ativarAbaInicial();

}

export { bootstrap };