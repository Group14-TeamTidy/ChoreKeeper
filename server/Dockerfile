FROM node:18
WORKDIR /ChoreKeeper/server
COPY . .
RUN npm install -g npm@9.5.0
RUN npm i
EXPOSE 4000
# RUN node ./server/server.js
CMD ["node", "server.js"]