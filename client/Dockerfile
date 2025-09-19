#TODO: actual packages versions
FROM node:16
WORKDIR /app

RUN npm install -g npm@8.12.1

COPY ./fragileClient/package*.json ./
RUN npm install

COPY ./fragileCLient .

EXPOSE 8137

CMD [ "npm", "run", "dev" ]