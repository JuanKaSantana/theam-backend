FROM node

RUN mkdir -p /usr/src/theam-backend

WORKDIR /usr/src/theam-backend

COPY package.json package-lock.json ./

RUN npm install --quiet

RUN npm install nodemon -g --quiet

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
