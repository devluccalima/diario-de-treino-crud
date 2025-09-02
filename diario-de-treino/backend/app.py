from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import uuid
import logging

# Configuração do logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app = Flask(__name__)
CORS(app) # Habilita CORS para permitir requisições do React

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# Função para inicializar o banco de dados
def init_db():
    with app.app_context():
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;") # Habilita chaves estrangeiras
        cursor.execute("CREATE TABLE IF NOT EXISTS rotinas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, dia_da_semana TEXT NOT NULL)")
        cursor.execute("CREATE TABLE IF NOT EXISTS exercicios_da_rotina (id INTEGER PRIMARY KEY AUTOINCREMENT, rotina_id INTEGER NOT NULL, exercicio_wger_uuid TEXT UNIQUE NOT NULL, nome_exercicio TEXT NOT NULL, series INTEGER, repeticoes INTEGER, peso REAL, FOREIGN KEY (rotina_id) REFERENCES rotinas (id) ON DELETE CASCADE)")
        db.commit()
        db.close()

# Chame init_db() ao iniciar a aplicação
with app.app_context():
    init_db()

@app.route('/api/rotinas', methods=['GET'])
def get_rotinas():
    conn = get_db_connection()
    get_rotinas_db = conn.execute('SELECT * FROM rotinas').fetchall()
    conn.close()
    get_rotinas = [dict(row) for row in get_rotinas_db]
    logging.info(f"Rotinas buscadas: {get_rotinas}")
    return jsonify(get_rotinas)

@app.route('/api/rotinas', methods=['POST'])
def add_new_rotina():
    try:
        nova_rotina = request.get_json()
        if not nova_rotina or 'nome' not in nova_rotina or 'dia_da_semana' not in nova_rotina:
            logging.warning("Dados inválidos para adicionar rotina.")
            return jsonify({'message': 'Dados inválidos'}), 400

        conn = get_db_connection()
        conn.execute('INSERT INTO rotinas (nome, dia_da_semana) VALUES (?, ?)',
                     (nova_rotina['nome'], nova_rotina['dia_da_semana']))
        conn.commit()
        conn.close()
        logging.info(f"Nova rotina adicionada: {nova_rotina['nome']}")
        return jsonify({'status': 'success', 'message': 'Rotina adicionada com sucesso!'}), 201
    except Exception as e:
        logging.error(f"Erro ao adicionar rotina: {e}")
        return jsonify({'message': 'Erro ao adicionar rotina', 'error': str(e)}), 500

@app.route('/api/rotinas/<int:id>/exercicios', methods=['GET'])
def get_exercicios_da_rotina(id):
    conn = get_db_connection()
    get_exercicios_db = conn.execute('SELECT * FROM exercicios_da_rotina WHERE rotina_id = ?', (id,)).fetchall()
    conn.close()
    get_exercicios = [dict(row) for row in get_exercicios_db]
    logging.info(f"Exercícios para rotina {id} buscados: {get_exercicios}")
    return jsonify(get_exercicios)

@app.route('/api/rotinas/<int:rotina_id>/exercicios', methods=['POST'])
def add_exercicio_a_rotina(rotina_id):
    try:
        dados_exercicio = request.get_json()
        if not dados_exercicio or 'nome' not in dados_exercicio or 'series' not in dados_exercicio or 'repeticoes' not in dados_exercicio or 'peso' not in dados_exercicio:
            logging.warning("Dados inválidos para adicionar exercício.")
            return jsonify({'message': 'Dados inválidos'}), 400

        exercicio_uuid = str(uuid.uuid4())

        conn = get_db_connection()
        conn.execute(
            'INSERT INTO exercicios_da_rotina (rotina_id, exercicio_wger_uuid, nome_exercicio, series, repeticoes, peso) VALUES (?, ?, ?, ?, ?, ?)',
            (
                rotina_id,
                exercicio_uuid,
                dados_exercicio['nome'],
                dados_exercicio['series'],
                dados_exercicio['repeticoes'],
                dados_exercicio['peso']
            )
        )
        conn.commit()
        conn.close()
        logging.info(f"Exercício adicionado à rotina {rotina_id}: {dados_exercicio['nome']}")
        return jsonify({'status': 'success', 'message': 'Exercício adicionado à rotina!'}), 201
    except Exception as e:
        logging.error(f"Erro ao adicionar exercício à rotina: {e}")
        return jsonify({'message': 'Erro ao adicionar exercício à rotina', 'error': str(e)}), 500

@app.route('/api/exercicios/<string:exercicio_uuid>', methods=['DELETE'])
def deletar_exercicio(exercicio_uuid):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM exercicios_da_rotina WHERE exercicio_wger_uuid = ?', (exercicio_uuid,))
        if cursor.rowcount == 0:
            logging.warning(f"Exercício com UUID {exercicio_uuid} não encontrado para exclusão.")
            return jsonify({'message': 'Exercício não encontrado'}), 404
        conn.commit()
        conn.close()
        logging.info(f"Exercício com UUID {exercicio_uuid} excluído com sucesso.")
        return jsonify({'message': 'Exercício excluído com sucesso'}), 200
    except Exception as e:
        logging.error(f"Erro ao excluir exercício com UUID {exercicio_uuid}: {e}")
        return jsonify({'message': 'Erro ao excluir exercício', 'error': str(e)}), 500

@app.route('/api/exercicios/<string:exercicio_uuid>', methods=['PUT'])
def editar_exercicio(exercicio_uuid):
    try:
        dados = request.get_json()
        series = dados.get('series')
        repeticoes = dados.get('repeticoes')
        peso = dados.get('peso')

        if series is None or repeticoes is None or peso is None:
            logging.warning("Dados incompletos para editar exercício.")
            return jsonify({'message': 'Dados incompletos'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE exercicios_da_rotina SET series = ?, repeticoes = ?, peso = ? WHERE exercicio_wger_uuid = ?',
                       (series, repeticoes, peso, exercicio_uuid))
        if cursor.rowcount == 0:
            logging.warning(f"Exercício com UUID {exercicio_uuid} não encontrado para edição.")
            return jsonify({'message': 'Exercício não encontrado'}), 404
        conn.commit()
        
        exercicio_atualizado_db = conn.execute('SELECT * FROM exercicios_da_rotina WHERE exercicio_wger_uuid = ?', (exercicio_uuid,)).fetchone()
        conn.close()
        
        exercicio_atualizado = dict(exercicio_atualizado_db)
        logging.info(f"Exercício com UUID {exercicio_uuid} atualizado: {exercicio_atualizado}")
        return jsonify(exercicio_atualizado), 200
    except Exception as e:
        logging.error(f"Erro ao editar exercício com UUID {exercicio_uuid}: {e}")
        return jsonify({'message': 'Erro ao editar exercício', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


