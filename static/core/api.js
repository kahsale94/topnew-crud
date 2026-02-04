import { API_BASE } from "../core/config.js";

async function api(url, method = "GET", body = null, retry = true) {
    const token = localStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const options = { method, headers };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 401 && retry) {
        const refreshed = await refreshToken();

        if (!refreshed) {
            throw { status: 401, message: "Sessão expirada" };
        }

        return api(url, method, body, false);
    }

    if (!response.ok) {
        let message = "Erro inesperado";

        try {
            const errorData = await response.json();
            message = errorData.detail || message;
        } catch {}

        throw { status: response.status, message };
    }

    return response.json();
}

async function refreshToken() {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) return false;

    const response = await fetch(
        `${API_BASE}/auth/refresh?refresh_token=${refresh}`,
        { method: "POST" }
    );

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    return true;
}

export { api };