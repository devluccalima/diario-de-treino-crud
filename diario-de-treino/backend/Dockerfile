FROM python:3.11-slim

# Define diretório de trabalho
WORKDIR /app

# Copia apenas dependências primeiro (cache build)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código
COPY . .

# Expõe porta padrão do Flask
EXPOSE 5000

# Comando padrão
CMD ["python", "app.py"]
