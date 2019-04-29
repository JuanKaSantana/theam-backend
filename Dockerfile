FROM node:9.5.0

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

RUN mongoimport --host mongo --port 27017 --db theam --collection users --mode upsert --type json --file /data/data.json --jsonArray

EXPOSE 5000

ENTRYPOINT ["npm", "start"]