FROM node:23-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5003

CMD ["npm", "start"]
