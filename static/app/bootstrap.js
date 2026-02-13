import { initUserMenu } from "../core/ui.js";
import { verificarAuth } from "../core/guard.js";
import { initTabs, ativarAbaInicial } from "./tabs.js";
import { initPedidos } from "../pages/pedidos.pages.js";
import { initEstoque } from "../pages/estoque.pages.js";
import { initClientes } from "../pages/clientes.pages.js";
import { initProdutos } from "../pages/produtos.pages.js";

async function bootstrap() {
    
    if (!verificarAuth()) return;

    initUserMenu();

    initPedidos?.();
    initClientes?.();
    initProdutos?.();
    initEstoque?.();

    initTabs();
    ativarAbaInicial();
}

export { bootstrap };