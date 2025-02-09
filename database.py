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

# Criar um usuário administrador padrão (se não existir)
cursor.execute("SELECT COUNT(*) FROM tb_usuarios")
if cursor.fetchone()[0] == 0:
    cursor.execute("INSERT INTO tb_usuarios (usuario, senha) VALUES (?, ?)", ("admin", "1234"))


# Verifica se os produtos já existem antes de adicionar
cursor.execute("SELECT COUNT(*) FROM tb_produtos")
if cursor.fetchone()[0] == 0:
    cursor.executemany("INSERT INTO tb_produtos (nome, descricao, preco, imagem) VALUES (?, ?, ?, ?)", produtos_iniciais)

# Salvar e fechar conexão
conn.commit()
conn.close()

print("Banco de dados atualizado e populado com sucesso!")
