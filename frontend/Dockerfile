FROM node:18 AS react-build
WORKDIR /ChoreKeeper/frontend
COPY . .
RUN npm install -g npm@9.5.0
RUN npm i
EXPOSE 3000
CMD ["npm", "start"]