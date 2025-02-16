import sqlite3

# Conectar ao banco de dados (ou criar se não existir)
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Criar a tabela de produtos (agora incluindo a coluna de imagem)
cursor.execute('''
    CREATE TABLE IF NOT EXISTS tb_produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT NOT NULL,
        preco REAL NOT NULL,
        imagem TEXT  -- Novo campo para armazenar o caminho da imagem
    )
''')

# Inserir produtos iniciais (caso não existam)
produtos_iniciais = [
    ('Café Tradicional', 'Aquele café fresquinho que alegra seu dia.', 5.00, './imagens/cafe.jpg'),
    ('Cappuccino', 'Com um toque de chocolate e cremosidade irresistível.', 7.50, './imagens/cappuccino.jpg'),
    ('Pão de Queijo', 'Quentinho, macio e perfeito para acompanhar.', 3.50, './imagens/paoqueijo.jpg'),
    ('Bolo Caseiro', 'Sabor de infância em cada pedaço.', 6.00, './imagens/bolo.jpg')
]

# Criar tabela de usuários se não existir
cursor.execute('''
    CREATE TABLE IF NOT EXISTS tb_usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
    )
''')

# Criar a tabela de vendas
cursor.execute('''
    CREATE TABLE IF NOT EXISTS tb_vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total REAL NOT NULL
    )
''')

# Criar a tabela de itens vendidos
cursor.execute('''
    CREATE TABLE IF NOT EXISTS tb_itens_venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venda_id INTEGER NOT NULL,
        produto_id INTEGER NOT NULL,
        quantidade INTEGER NOT NULL,
        preco_unitario REAL NOT NULL,
        FOREIGN KEY (venda_id) REFERENCES tb_vendas(id),
        FOREIGN KEY (produto_id) REFERENCES tb_produtos(id)
    )
''')

# Criar um usuário administrador padrão (se não existir)
cursor.execute("SELECT COUNT(*) FROM tb_usuarios")
if cursor.fetchone()[0] == 0:
    cursor.execute("INSERT INTO tb_usuarios (usuario, senha) VALUES (?, ?)", ("admin", "1234"))


# Verifica se os produtos já existem antes de adicionar
cursor.execute("SELECT COUNT(*) FROM tb_produtos")
if cursor.fetchone()[0] == 0:
    cursor.executemany("INSERT INTO tb_produtos (nome, descricao, preco, imagem) VALUES (?, ?, ?, ?)", produtos_iniciais)

# Criar TRIGGER para atualizar o total da venda automaticamente
cursor.execute('''
    CREATE TRIGGER IF NOT EXISTS atualizar_total_venda
    AFTER INSERT ON tb_itens_venda
    FOR EACH ROW
    BEGIN
        UPDATE tb_vendas
        SET total = (SELECT SUM(quantidade * preco_unitario) FROM tb_itens_venda WHERE venda_id = NEW.venda_id)
        WHERE id = NEW.venda_id;
    END;
''')

# Criar VIEW para visualizar todas as vendas com detalhes
cursor.execute('''
    CREATE VIEW IF NOT EXISTS view_vendas_detalhadas AS
    SELECT v.id AS venda_id, v.data, p.nome AS produto, iv.quantidade, iv.preco_unitario,
           (iv.quantidade * iv.preco_unitario) AS subtotal
    FROM tb_vendas v
    JOIN tb_itens_venda iv ON v.id = iv.venda_id
    JOIN tb_produtos p ON iv.produto_id = p.id;
''')

# Salvar e fechar conexão
conn.commit()
conn.close()

print("Banco de dados atualizado e populado com sucesso!")
