FROM node:latest

LABEL version="1.0"
LABEL description="Backend API services developed on Express"
LABEL maintainer "juancarlossantanadominguez@gmail.com"

RUN apt-get update

RUN mkdir -p /usr/src/theam-backend
RUN mkdir -p /var/log/node
RUN chown node:node /var/log/node

WORKDIR /usr/src/theam-backend

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]