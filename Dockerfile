FROM node:latest

# Install ffmpeg
RUN echo "deb http://ftp.uk.debian.org/debian jessie-backports main" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get -y install ffmpeg

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . ./

# add `/usr/src/node_modules/.bin` to $PATH
ENV PATH /usr/src/node_modules/.bin:$PATH

# install and cache app dependencies
ADD package.json /usr/src/package.json
RUN yarn install
#RUN npm install --unsafe-perm=true

EXPOSE 3000

# start app
CMD ["yarn", "start"]

# docker build . -t fserver
# docker run -it -v ~+:/usr/src/app -p 5000:3000 fserver