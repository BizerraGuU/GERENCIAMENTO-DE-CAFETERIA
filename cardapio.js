document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
});

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
                        <button class="add-carrinho" 
                            data-id="${produto.id}" 
                            data-nome="${produto.nome}" 
                            data-preco="${produto.preco}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                `;
            });

            // Adiciona evento de clique a todos os botões corretamente
            document.querySelectorAll(".add-carrinho").forEach(botao => {
                botao.addEventListener("click", (event) => {
                    adicionarAoCarrinho(event.target);
                });
            });
        });
}

// Remove produto do carrinho
function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

// Função para adicionar ao carrinho
let carrinho = [];
function adicionarAoCarrinho(botao) {
    const id = parseInt(botao.getAttribute("data-id")); // Obtém o ID corretamente
    const nome = botao.getAttribute("data-nome");
    const preco = parseFloat(botao.getAttribute("data-preco"));
    
    if (!id) {
        console.error("Erro: Produto sem ID válido!", botao);
        alert("Erro: Produto sem ID válido!");
        return;
    }

    const produtoExistente = carrinho.find(item => item.produto_id === id);
    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        carrinho.push({ produto_id: id, nome, preco, quantidade: 1 });
    }

    atualizarCarrinho();
}


// Função para atualizar o carrinho
function atualizarCarrinho() {
    const contador = document.getElementById("contador-carrinho");
    const listaCarrinho = document.getElementById("lista-carrinho");
    const totalCarrinho = document.getElementById("total-carrinho");

    listaCarrinho.innerHTML = "";
    let total = 0;
    let cont = 0;

    carrinho.forEach((item, index) => {
        listaCarrinho.innerHTML += `
            <li>${item.nome} - R$ ${item.preco.toFixed(2)} x ${item.quantidade}
            <button onclick="removerDoCarrinho(${index})">❌</button></li>`;
        total += item.preco * item.quantidade;
        cont += item.quantidade;
    });

    totalCarrinho.innerHTML = `Total: R$ ${total.toFixed(2)}`;
    contador.innerText = cont;
}

// Função para finalizar o pedido
function finalizarPedido() {
    const modalPedido = document.getElementById("modal-pedido");
    const detalhesPedido = document.getElementById("detalhes-pedido");
    const totalPedido = document.getElementById("total-pedido");

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    detalhesPedido.innerHTML = "";
    let total = 0;

    // Criar estrutura de dados para enviar ao servidor
    let itensPedido = carrinho.map(produto => ({
        produto_id: produto.produto_id,  // Certifique-se de que 'produto_id' existe
        nome: produto.nome,
        quantidade: produto.quantidade,
        preco: produto.preco
    }));

    console.log("Enviando pedido:", itensPedido); // Verificar antes de enviar

    // Enviar para o servidor
    fetch("http://127.0.0.1:5000/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens: itensPedido })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Pedido registrado:", data);
        if (data.erro) {
            alert("Erro ao registrar pedido: " + data.erro);
            return;
        }

        carrinho.forEach(item => {
            detalhesPedido.innerHTML += `<li>${item.nome} - R$ ${item.preco.toFixed(2)} x ${item.quantidade}</li>`;
            total += item.preco * item.quantidade;
        });
    
        localStorage.setItem("ultimoPedido", JSON.stringify(carrinho));

        totalPedido.innerHTML = `Total: R$ ${total.toFixed(2)}`;
        //modalPedido.style.display = "flex";

        // Limpar carrinho
        carrinho = [];
        atualizarCarrinho();
    })
    .catch(error => console.error("Erro ao registrar venda:", error));
}


// Funções para abrir e fechar o modal de Pedido Finalizado
function fecharModal() {
    document.getElementById("modal-pedido").style.display = "none";
}

// Exibir o modal do último pedido
function abrirModalUltimoPedido() {
    let pedido = JSON.parse(localStorage.getItem("ultimoPedido"));

    if (!pedido || pedido.length === 0) {
        alert("Nenhum pedido foi finalizado ainda.");
        return;
    }

    let total = pedido.reduce((acc, prod) => acc + prod.preco * prod.quantidade, 0);
    document.getElementById("lista-ultimo-pedido").innerHTML = pedido.map(p => `<li>${p.nome} - R$ ${p.preco.toFixed(2)} x ${p.quantidade} </li>`).join("");
    document.getElementById("total-ultimo-pedido").textContent = `Total: R$ ${total.toFixed(2)}`;

    document.getElementById("modal-ultimo-pedido").style.display = "flex";
}

function fecharModalUltimoPedido() {
    document.getElementById("modal-ultimo-pedido").style.display = "none";
}

// Função para exibir o carrinho
function toggleCarrinho() {
    const carrinho = document.getElementById("carrinho");
    carrinho.classList.toggle("aberto");
}
