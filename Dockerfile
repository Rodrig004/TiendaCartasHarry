# Node.js versión 18
FROM node:18-alpine

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar TODO el código de la aplicación
COPY . .

# Es el puerto 3000
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]

#Rodigo Gonzalez Xocua 