const API_BASE = window.APP_CONFIG.API_BASE;

async function api(url, method = "GET", body = null) {
    const token = localStorage.getItem("access_token");
    
    const headers = {
        "Content-Type": "application/json"
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    
    const options = {
        method,
        headers
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (response.status === 401 && retry) {
        const refreshed = await refreshAccessToken();

        if (!refreshed) {
            localStorage.clear();
            window.location.href = "/login";
            throw new Error("Sessão expirada");
        }

        return api(url, method, body, false);
    }    

    if (response.status === 401) {
        logout();
        throw new Error("Não autorizado");
    }
    
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
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