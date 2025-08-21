from flask import Flask, jsonify, request # Importa as bibliotecas Flask, jsonify e request
from flask_cors import CORS # Importa as bibliotecas Flask e Flask-CORS
import sqlite3

#Cria a aplicação Flask
app = Flask(__name__)
CORS(app) # Habilita CORS para permitir requisições do React

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

#Define a endpoint da API que o React vai chamar
@app.route('/api/exercicios', methods=['GET'])
def get_exercicios():  
    conn = get_db_connection()
    exercicios_db = conn.execute('SELECT * FROM exercicios').fetchall()
    conn.close()
    lista_exercicios = [dict(row) for row in exercicios_db]

    return jsonify(lista_exercicios)

# Rota para adicionar um novo exercício
@app.route('/api/exercicios', methods=['POST'])
def add_exercicio():
    novo_exercicio = request.get_json()
    conn = get_db_connection() # Conecta ao banco de dados
    conn.execute('INSERT INTO exercicios (nome, repeticoes, series, peso) VALUES (?, ?, ?, ?)', # Insere o novo exercício
                 (novo_exercicio['nome'], novo_exercicio['repeticoes'], novo_exercicio['series'], novo_exercicio['peso']))
    conn.commit() # Salva as mudanças
    conn.close() # Fecha a conexão com o banco de dados
    return jsonify({'status': 'success','message': 'Exercício adicionado com sucesso!'})

# Rota para deletar exercício especifico pelo ID
@app.route('/api/exercicios/<int:id>', methods=['DELETE'])
def delete_exercicio(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM exercicios WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success','message': 'Exercício deletado com sucesso!'})

# Rota para atualizar exercício especifico pelo ID
@app.route('/api/exercicios/<int:id>', methods=['PUT'])
def update_exercicio(id):
    dados_atualizados = request.get_json()
    conn = get_db_connection()
    conn.execute('UPDATE exercicios SET nome = ?, repeticoes = ?, series = ?, peso = ? WHERE id = ?',
                (dados_atualizados['nome'], dados_atualizados['series'], dados_atualizados['repeticoes'], dados_atualizados['peso'], id))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success','message': 'Exercício atualizado com sucesso!'})
    


#Roda a aplicação Flask
if __name__ == '__main__':
    app.run(debug=True)
