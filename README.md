# FStorage - File procecessing and storage


Image and video files processing and storage.
reduce image file sizes: imageoptim.com - strip out metadata
prefer h.264 mp4, webM, progressive jpeg, ?webP, gifs -> mp4
animated GIFs uploaded to Twitter are actually converted to video.
npm install imagemin
/?compress=false&thumb=300&format=png&crop=400&progressive=true

Mock storage with API for CREATE, DELETE and GET static posts files

## Architecture

1. Node, Koa

## Run the project

### Setup

1. Fork/Clone this repo

1. Download [Docker](https://docs.docker.com/docker-for-mac/install/) (if necessary)

1. Make sure you are using a Docker version >= 17:

    ```sh
    $ docker -v
    Docker version 17.03.0-ce, build 60ccb22
    ```

### Build and Run the App

1. Build the image:
  
    ```sh
    $ cd fserver
    $ docker build -t fserver .
    ```
1. Set the Environment variables

    ```sh
    $ export NODE_ENV=development
    ```
1. Run the container:

    ```sh
    $ docker run -it -p 5000:3000 fserver
    ```
1. Go to http://localhost:5000


### Run tests

1. Set the Environment variable
    ```sh
    $ export NODE_ENV=test
    ```

1. With the apps up, run:

    ```sh
    $ cd server && npm run test
