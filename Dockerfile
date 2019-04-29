FROM node:9.5.0

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "run", "seed"]

EXPOSE 5000

ENTRYPOINT ["npm", "start"]