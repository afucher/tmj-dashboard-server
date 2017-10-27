FROM node:8-alpine

ADD . /opt/app  
WORKDIR /opt/app  
RUN npm install

ENV PORT=3000

EXPOSE 3000  

CMD ["node", "--harmony", "index.js"] 