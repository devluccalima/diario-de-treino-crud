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
@app.route('/api/rotinas', methods=['GET'])
def get_rotinas(): 
    conn = get_db_connection()
    get_rotinas_db = conn.execute('SELECT * FROM rotinas').fetchall()
    conn.close()
    get_rotinas = [dict(row) for row in get_rotinas_db]
    return jsonify(get_rotinas)

# Rota para adicionar um novo exercício

@app.route('/api/rotinas', methods=['POST'])
def add_newrotina():
    nova_rotina = request.get_json()
    conn = get_db_connection() # Conecta ao banco de dados
    conn.execute('INSERT INTO rotinas (nome, dia_da_semana) VALUES (?, ?)', # Insere nova rotina
    (nova_rotina['nome'], nova_rotina['dia_da_semana']))
    conn.commit() # Salva as mudanças
    conn.close() # Fecha a conexão com o banco de dados
    return jsonify({'status': 'success','message': 'Rotina adicionado com sucesso!'})

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

# Não precisa de novos imports

# ... (o resto do seu código, app, CORS, get_db_connection, etc.) ...

# Rota para adicionar um exercício a uma rotina específica
@app.route('/api/rotinas/<int:rotina_id>/exercicios', methods=['POST'])
def add_exercicio_a_rotina(rotina_id):
    dados_exercicio = request.get_json()
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO exercicios_da_rotina (rotina_id, exercicio_wger_uuid, nome_exercicio, series, repeticoes, peso) VALUES (?, ?, ?, ?, ?, ?)',
        (
            rotina_id,
            dados_exercicio['uuid'],
            dados_exercicio['nome'],
            dados_exercicio['series'],
            dados_exercicio['repeticoes'],
            dados_exercicio['peso']
        )
    )
    conn.commit()
    conn.close()
    return jsonify({'status': 'success', 'message': 'Exercício adicionado à rotina!'})


#Roda a aplicação Flask
if __name__ == '__main__':
    app.run(debug=True)
