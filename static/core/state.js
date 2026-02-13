export const state = {

    clientes: {
        cache: [],
        
        ui: {
            editando: null
        }
    },

    produtos: {
        cache: [],

        ui: {
            editando: null
        }
    },

    estoque: {
        cache: [],

        ui: {
            editando: null
        }
    },

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

    auxiliares: {
        formasPagamento: [
            "Cartão de Crédito",
            "Cartão de Débito",
            "Pix",
            "Dinheiro",
        ],
    },
};