FROM node:12.13.1-alpine
COPY . /opt/sisyfos-audio-controller
WORKDIR /opt/sisyfos-audio-controller
EXPOSE 1176/tcp 
EXPOSE 1176/udp
EXPOSE 5255/tcp
EXPOSE 5255/udp
CMD ["yarn", "start"]