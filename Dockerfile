FROM node

LABEL version="1.0"
LABEL description="Backend services developed on Express"
LABEL maintainer "juancarlossantanadominguez@gmail.com"

RUN mkdir -p /usr/src/theam-backend

WORKDIR /usr/src/theam-backend

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]