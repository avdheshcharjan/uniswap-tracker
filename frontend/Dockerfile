FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

RUN npm install

COPY . .

RUN npm run build