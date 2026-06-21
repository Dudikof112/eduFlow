# Obraz backendu (Node.js + Express). Pełny obraz Debian — bcrypt korzysta z gotowych binariów.
FROM node:20

WORKDIR /app

# Najpierw manifesty (lepsze cache warstw przy instalacji zależności)
COPY package*.json ./
RUN npm install --omit=dev

# Kod aplikacji
COPY . .

# Katalogi na pliki wgrywane przez użytkowników (wideo, materiały)
RUN mkdir -p uploads/videos uploads/materials

EXPOSE 5000
CMD ["node", "src/app.js"]
