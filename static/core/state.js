export const state = {

    // ===== CLIENTES =====
    clientes: {
        cache: [],
        
        ui: {
            editando: null
        }
    },

    // ===== PRODUTOS =====
    produtos: {
        cache: [],

        ui: {
            editando: null
        }
    },

    // ===== ESTOQUE =====
    estoque: {
        cache: [],

        ui: {
            editando: null
        }
    },

    // ===== PEDIDOS =====
    pedidos: {
        cache: [],
        itensPorPedido: {},

        itensNovoPedido: [],

        ui: {
            pedidoEditando: null,
            pedidoAberto: null,
            detalhesAbertos: null,
            itemEditando: null,
        }
    },

    // ===== AUXILIARES =====
    auxiliares: {
        formasPagamento: [
            "Cartão de Crédito",
            "Cartão de Débito",
            "Pix",
            "Dinheiro",
        ],
    },
};