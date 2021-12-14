FROM node:16-alpine
RUN apk add --no-cache git
COPY . /opt/sisyfos-audio-controller
WORKDIR /opt/sisyfos-audio-controller
RUN yarn install
RUN yarn remove electron electron-builder prettier typescript
EXPOSE 1176/tcp
EXPOSE 1176/udp
EXPOSE 5255/tcp
EXPOSE 5255/udp
CMD ["yarn", "start"]
