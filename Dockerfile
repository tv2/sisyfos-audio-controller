FROM node:12.13.1-alpine
RUN apk add --no-cache git
COPY . /opt/sisyfos-audio-controller
WORKDIR /opt/sisyfos-audio-controller
RUN yarn install
EXPOSE 1176/tcp 
EXPOSE 1176/udp
EXPOSE 5255/tcp
EXPOSE 5255/udp
CMD ["yarn", "start"]
