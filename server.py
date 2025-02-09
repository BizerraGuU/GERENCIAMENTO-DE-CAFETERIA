from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configurar diretório onde as imagens serão armazenadas
UPLOAD_FOLDER = "imagens"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

# Criar a pasta 'imagens' se não existir
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def conectar_banco():
    return sqlite3.connect("database.db")

# Permitir requisições de qualquer origem para todos os endpoints
CORS(app, resources={r"/produtos/*": {"origins": "*"}})

# Função para verificar se a extensão do arquivo é permitida
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Rota para listar produtos
@app.route('/produtos', methods=['GET'])
def get_produtos():
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nome, descricao, preco, imagem FROM tb_produtos")
    produtos = cursor.fetchall()
    conn.close()

    produtos_json = [{"id": p[0], "nome": p[1], "descricao": p[2], "preco": p[3], "imagem": p[4]} for p in produtos]
    return jsonify(produtos_json)

# Rota para servir imagens
@app.route('/imagens/<path:filename>')
def servir_imagem(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# Rota para adicionar um produto
@app.route("/produtos", methods=["POST"])
def adicionar_produto():
    nome = request.form.get("nome")
    descricao = request.form.get("descricao")
    preco = request.form.get("preco")
    imagem = request.files.get("imagem")

    # Se houver imagem, salva no diretório
    if imagem and allowed_file(imagem.filename):
        filename = secure_filename(imagem.filename)
        imagem_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        imagem.save(imagem_path)
        imagem_url = f"imagens/{filename}"
    else:
        imagem_url = "imagens/default.jpg"  # Imagem padrão caso não seja enviada

    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO tb_produtos (nome, descricao, preco, imagem) VALUES (?, ?, ?, ?)", 
                   (nome, descricao, preco, imagem_url))
    conn.commit()
    conn.close()
    return jsonify({"mensagem": "Produto adicionado com sucesso!"})

# Rota para editar um produto (incluindo imagem)
@app.route("/produtos/<int:id>", methods=["PUT"])
def editar_produto(id):
    nome = request.form.get("nome")
    descricao = request.form.get("descricao")
    preco = request.form.get("preco")
    imagem = request.files.get("imagem")

    conn = conectar_banco()
    cursor = conn.cursor()

    # Se uma nova imagem for enviada, substituímos
    if imagem and allowed_file(imagem.filename):
        filename = secure_filename(imagem.filename)
        imagem_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        imagem.save(imagem_path)
        imagem_url = f"imagens/{filename}"
        cursor.execute("UPDATE tb_produtos SET nome=?, descricao=?, preco=?, imagem=? WHERE id=?", 
                       (nome, descricao, preco, imagem_url, id))
    else:
        cursor.execute("UPDATE tb_produtos SET nome=?, descricao=?, preco=? WHERE id=?", 
                       (nome, descricao, preco, id))

    conn.commit()
    conn.close()
    return jsonify({"mensagem": "Produto atualizado com sucesso!"})

# Rota para deletar um produto
@app.route("/produtos/<int:id>", methods=["DELETE"])
def deletar_produto(id):
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tb_produtos WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"mensagem": "Produto removido com sucesso!"})

# Rota para verificar login
@app.route('/login', methods=['POST'])
def login():
    dados = request.json
    usuario = dados.get("usuario")
    senha = dados.get("senha")

    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tb_usuarios WHERE usuario = ? AND senha = ?", (usuario, senha))
    usuario_encontrado = cursor.fetchone()
    conn.close()

    if usuario_encontrado:
        return jsonify({"mensagem": "Login bem-sucedido!", "status": "sucesso"})
    else:
        return jsonify({"mensagem": "Usuário ou senha incorretos!", "status": "erro"}), 401


if __name__ == "__main__":
    app.run(debug=True)
