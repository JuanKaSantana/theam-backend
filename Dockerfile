FROM node:9.5.0

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

COPY .env.prod .env

EXPOSE 5000

ENTRYPOINT ["npm", "start"]
