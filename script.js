document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();

    document.getElementById("form-produto").addEventListener("submit", function(event) {
        event.preventDefault();
        adicionarProduto();
    });

    document.getElementById("form-editar-produto").addEventListener("submit", function(event) {
        event.preventDefault();
        salvarEdicaoProduto();
    });

    document.getElementById("open-menu").addEventListener("click", abrirMenu);
    document.getElementById("close-menu").addEventListener("click", fecharMenu);
    document.getElementById("close-modal").addEventListener("click", fecharModal);
    document.getElementById("imagem").addEventListener("change", atualizarPreview);
});

// Abrir e fechar menu retrátil
function abrirMenu() {
    document.getElementById("menu-retratil").classList.add("show");
}

function fecharMenu() {
    document.getElementById("menu-retratil").classList.remove("show");
}

// Atualizar pré-visualização do produto
function atualizarPreview() {
    const nome = document.getElementById("nome").value || "Nome do Produto";
    const descricao = document.getElementById("descricao").value || "Descrição do produto";
    const preco = document.getElementById("preco").value || "0.00";
    const imagem = document.getElementById("imagem").files[0];

    document.getElementById("preview-nome").textContent = nome;
    document.getElementById("preview-descricao").textContent = descricao;
    document.getElementById("preview-preco").textContent = `R$ ${parseFloat(preco).toFixed(2)}`;

    if (imagem) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("preview-imagem").src = e.target.result;
        };
        reader.readAsDataURL(imagem);
    }
}

// Função para adicionar produto
function adicionarProduto() {
    const formData = new FormData();
    formData.append("nome", document.getElementById("nome").value);
    formData.append("descricao", document.getElementById("descricao").value);
    formData.append("preco", document.getElementById("preco").value);
    formData.append("imagem", document.getElementById("imagem").files[0]);

    fetch("http://127.0.0.1:5000/produtos", {
        method: "POST",
        body: formData
    }).then(() => {
        carregarProdutos();
        fecharMenu();
        document.getElementById("form-produto").reset();
        atualizarPreview(); // Reseta a pré-visualização
    });
}

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
                        <button onclick="abrirModal(${produto.id}, '${produto.nome}', '${produto.descricao}', ${produto.preco})">Editar</button>
                        <button onclick="deletarProduto(${produto.id})">Remover</button>
                    </div>
                `;
            });
        });
}

// 🔹 Função para abrir modal de edição
function abrirModal(id, nome, descricao, preco, imagem) {
    const modal = document.getElementById("modal");
    if (!modal) return;

    modal.style.display = "flex";

    document.getElementById("produto-id").value = id;
    document.getElementById("editar-nome").value = nome;
    document.getElementById("editar-descricao").value = descricao;
    document.getElementById("editar-preco").value = preco;
    
    const imgPreview = document.getElementById("editar-imagem-preview");
    if (imagem) {
        imgPreview.src = `http://127.0.0.1:5000/${imagem}`;
    } else {
        imgPreview.src = "imagens/default.jpg";
    }
}

// 🔹 Função para fechar o modal
function fecharModal() {
    const modal = document.getElementById("modal");
    if (modal) modal.style.display = "none";
}

// 🔹 Atualizar pré-visualização da nova imagem no modal
document.getElementById("editar-imagem").addEventListener("change", function () {
    const imagem = this.files[0];
    if (imagem) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("editar-imagem-preview").src = e.target.result;
        };
        reader.readAsDataURL(imagem);
    }
});


// 🔹 Função para salvar a edição do produto
function salvarEdicaoProduto() {
    const id = document.getElementById("produto-id").value;
    const formData = new FormData();
    formData.append("nome", document.getElementById("editar-nome").value);
    formData.append("descricao", document.getElementById("editar-descricao").value);
    formData.append("preco", document.getElementById("editar-preco").value);

    const imagem = document.getElementById("editar-imagem").files[0];
    if (imagem) {
        formData.append("imagem", imagem);
    }

    fetch(`http://127.0.0.1:5000/produtos/${id}`, {
        method: "PUT",
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error("Erro ao salvar edição");
        }
        return response.json();
    }).then(() => {
        fecharModal();
        carregarProdutos();
    }).catch(error => {
        console.error("Erro ao editar produto:", error);
        alert("Erro ao editar produto. Verifique o console.");
    });
}

// Função para deletar produto
function deletarProduto(id) {
    if (confirm("Tem certeza que deseja remover este produto?")) {
        fetch(`http://127.0.0.1:5000/produtos/${id}`, {
            method: "DELETE"
        }).then(() => carregarProdutos());
    }
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

// Abrir o modal de vendas
function abrirModalVendas() {
    document.getElementById("modal-vendas").style.display = "flex";
    carregarVendas();
}

// Fechar o modal de vendas
function fecharModalVendas() {
    document.getElementById("modal-vendas").style.display = "none";
}

// ✅ Função para filtrar vendas por ID, data ou nome do produto
function filtrarVendas() {
    const termo = document.getElementById("barra-pesquisa-vendas").value.toLowerCase();
    const dataFiltro = document.getElementById("filtro-data").value;
    const vendas = document.querySelectorAll(".venda-item");

    vendas.forEach(venda => {
        const idVenda = venda.querySelector(".venda-id").textContent.toLowerCase();
        const dataVenda = venda.querySelector(".venda-data").textContent.toLowerCase();
        const itensVenda = venda.querySelector(".venda-itens").textContent.toLowerCase();

        let corresponde = false;

        // Verifica se o ID, data ou itens contêm o termo pesquisado
        if (idVenda.includes(termo) || itensVenda.includes(termo)) {
            corresponde = true;
        }

        // Verifica se a data coincide com a selecionada
        if (dataFiltro && !dataVenda.includes(dataFiltro)) {
            corresponde = false;
        }

        // Exibe ou oculta a venda
        venda.style.display = corresponde ? "block" : "none";
    });

    console.log("Termo buscado:", termo);
console.log("Data filtro:", dataFiltro);

vendas.forEach(venda => {
    console.log("Verificando venda:", venda);
    console.log("ID:", venda.querySelector(".venda-id")?.textContent);
    console.log("Data:", venda.querySelector(".venda-data")?.textContent);
    console.log("Itens:", venda.querySelector(".venda-itens")?.textContent);
});

}


function carregarVendas() {
    fetch("http://127.0.0.1:5000/vendas")
        .then(response => response.json())
        .then(data => {
            const listaVendas = document.getElementById("lista-vendas");
            listaVendas.innerHTML = "";

            if (data.length === 0) {
                listaVendas.innerHTML = "<p>Nenhuma venda registrada.</p>";
                return;
            }

            data.forEach(venda => {
                let vendaDiv = document.createElement("div");
                vendaDiv.classList.add("venda-item");

                vendaDiv.innerHTML = `
                    <h3 class="venda-id">Pedido #${venda.id}</h3>
                    <p class="venda-data">Data: ${venda.data}</p>
                    <p class="venda-total">Total: R$ ${venda.total.toFixed(2)}</p>
                    <ul class="venda-itens">
                        ${venda.itens.map(item => 
                            `<li>${item.quantidade}x ${item.nome} - R$ ${item.preco_unitario.toFixed(2)}</li>`
                        ).join("")}
                    </ul>
                    <hr>
                `;

                listaVendas.appendChild(vendaDiv);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar vendas:", error);
        });
}

