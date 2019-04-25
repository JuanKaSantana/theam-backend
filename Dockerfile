FROM mhart/alpine-node:8.11.4

RUN mkdir /usr/src/theam-backend

WORKDIR /usr/src/theam-backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 80

CMD ["npm", "start"]