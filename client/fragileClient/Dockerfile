#TODO: actual packages versions
FROM node:16
WORKDIR /app

RUN npm install -g npm@8.12.1

COPY ./package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 8137

CMD [ "npm", "run", "dev" ]