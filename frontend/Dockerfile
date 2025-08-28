FROM node:20-alpine

WORKDIR /app

# Copia package.json e instala dependências
COPY package*.json ./
RUN npm install

# Copia código
COPY . .

# Expõe porta do React (Vite ou CRA)
EXPOSE 3000

CMD ["npm", "start"]
