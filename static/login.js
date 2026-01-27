if (localStorage.getItem("access_token")) {
    window.location.href = "/";
}

async function handleLogin() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("erro");

    erro.textContent = "";

    try {
        await login(email, senha);
        window.location.href = "/";
    } catch (e) {
        erro.textContent = "Email ou senha inválidos";
    }
}