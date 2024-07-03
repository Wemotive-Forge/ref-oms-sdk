FROM node:18-alpine

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apk add chromium

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

#Need to copy utils as well

RUN npm cache verify

# Copy the current directory contents into the container at /usr/src/app
COPY . .

RUN npm install

#RUN npm run build

#ENV NODE_ENV production
ENV HOST 0.0.0.0
ENV PROTOCOL "http://"
ENV USE_FQDN_FOR_APIS false
ENV FQDN ""


EXPOSE 4000

CMD ["npm", "run", "start"]