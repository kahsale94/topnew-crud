import { logout } from "./auth.js";

const FEEDBACK_CONFIG = {

    timeout: 3500,
    types: {
        INFO: "info",
        SUCCESS: "success",
        ERROR: "error",
    }
};

function mostrarToast(mensagem, tipo = FEEDBACK_CONFIG.types.INFO) {
    
    const toast = document.getElementById("toast");

    if (!toast) {
        console.warn("Elemento #toast não encontrado");
        return;
    }

    toast.textContent = mensagem;
    toast.className = "toast";
    toast.classList.add(tipo);
    toast.classList.remove("hidden");

    clearTimeout(toast._timeout);

    toast._timeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, FEEDBACK_CONFIG.timeout);
}

function mostrarErro(mensagem) {
    mostrarToast(mensagem, FEEDBACK_CONFIG.types.ERROR);
}

function mostrarSucesso(mensagem) {
    mostrarToast(mensagem, FEEDBACK_CONFIG.types.SUCCESS);
}

function handleApiError(error) {

    if (!error) {
        mostrarErro("Erro inesperado");
        return;
    }

    const status = error.status;
    const mensagem = error.message || "Erro inesperado";

    if (status === 401) {
        mostrarErro("Sessão expirada. Faça login novamente.");
        localStorage.clear();

        setTimeout(logout, 1500);
        return;
    }

    mostrarErro(mensagem);
}

export {
    mostrarToast,
    mostrarErro,
    mostrarSucesso,
    handleApiError,
    FEEDBACK_CONFIG
};