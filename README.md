# 📓 Diario de Treino CRUD

Um projeto fullstack simples para gerenciamento de exercícios de academia.  
Permite **cadastrar, visualizar, editar e excluir** exercícios com informações básicas como **nome, repetições, séries e peso**.  
Desenvolvido com **Python (Flask)** no backend e **React** no frontend, utilizando **SQLite** como banco de dados.  

---

## 🚀 Tecnologias Utilizadas
- **Backend**: Python + Flask  
- **Frontend**: React.js  
- **Banco de Dados**: SQLite  
- **API REST** para comunicação entre frontend e backend  

---

## ⚙️ Funcionalidades
- Adicionar novos exercícios  
- Editar exercícios já cadastrados  
- Excluir exercícios  
- Listar todos os exercícios cadastrados  

---

## 📂 Estrutura do Projeto
diario-de-treino-crud/
│── backend/ # API Flask (rotas e integração com SQLite)
│── frontend/ # Aplicação React (interface de usuário)
│── README.md # Documentação do projeto

---

## ▶️ Como Rodar o Projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU-USUARIO/diario-de-treino-crud.git
cd diario-de-treino-crud

###2. Backend (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt
flask run

###3. Frontend (React)
```bash
cd frontend
npm install
npm start

---

## 🔗 Links Úteis
O frontend rodará em http://localhost:3000
O backend rodará em http://localhost:5000

---

🛠️ Melhorias Futuras

API externa para obter dados

Montar o treino por dias da semana, etc.

Autenticação de usuários

Dashboard com estatísticas de evolução

Deploy em nuvem (Render, Vercel, etc.)