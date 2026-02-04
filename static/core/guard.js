function verificarAuth() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "/login";
        return false;
    }

    return true;
}

export { verificarAuth };