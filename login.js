document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault();
        verificarLogin();
    });
});

function verificarLogin() {
    const usuario = document.getElementById("username").value;
    const senha = document.getElementById("password").value;

    fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "sucesso") {
            window.location.href = "menu.html"; // Redireciona para o menu
        } else {
            alert("Usuário ou senha incorretos!");
        }
    })
    .catch(error => console.error("Erro ao fazer login:", error));
}
