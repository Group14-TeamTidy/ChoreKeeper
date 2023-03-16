FROM node:18 AS react-build
WORKDIR /ChoreKeeper/frontend
COPY . .
RUN npm install -g npm@9.6.2
RUN npm i
EXPOSE 3000
CMD ["npm", "start"]