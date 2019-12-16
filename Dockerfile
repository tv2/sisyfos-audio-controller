FROM node:12.13.1-alpine
COPY . /opt/sisyfos-audio-controller
WORKDIR /opt/sisyfos-audio-controller
EXPOSE 1176 5255
CMD ["yarn", "start"]