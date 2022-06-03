FROM node:18.2.0

RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ADD package.json /usr/src/app/package.json
RUN npm install --legacy-peer-deps
ADD . /usr/src/app

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "run", "webpack-start"]
