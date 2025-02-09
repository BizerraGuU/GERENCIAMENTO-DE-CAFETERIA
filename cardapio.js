document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();

    document.getElementById("imagem").addEventListener("change", atualizarPreview);
});

// Função para carregar produtos
function carregarProdutos() {
    fetch("http://127.0.0.1:5000/produtos")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("produtos-container");
            container.innerHTML = "";
            data.forEach(produto => {
                container.innerHTML += `
                    <div class="produto" id="produto-${produto.id}">
                        <img src="http://127.0.0.1:5000/${produto.imagem}" alt="${produto.nome}">
                        <h3>${produto.nome}</h3>
                        <p>${produto.descricao}</p>
                        <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                    </div>
                `;
            });
        });
}

// 🔹 Função para filtrar produtos
function filtrarProdutos() {
    const termo = document.getElementById("barra-pesquisa").value.toLowerCase();
    const produtos = document.querySelectorAll(".produto");

    produtos.forEach(produto => {
        const nome = produto.querySelector("h3").textContent.toLowerCase();
        const descricao = produto.querySelector("p").textContent.toLowerCase();

        if (nome.includes(termo) || descricao.includes(termo)) {
            produto.style.display = "block";
        } else {
            produto.style.display = "none";
        }
    });
}

