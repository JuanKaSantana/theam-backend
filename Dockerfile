FROM node:latest

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

ENTRYPOINT ["npm", "start"]