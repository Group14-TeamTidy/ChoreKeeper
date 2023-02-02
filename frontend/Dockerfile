FROM node:18 AS react-build
WORKDIR /ChoreKeeper/frontend
COPY . .
RUN npm install -g npm@9.4.0
EXPOSE 3000
CMD ["npm", "start"]