# FStorage - File server

 * Processing (image/video).
 * Compressing.
 * Serving files /:storage/:filename

### Tech

 * Ffmpeg, Node, Koa, Sharp

### API - /api/v1

| Endpoint        | HTTP Method | CRUD Method | Result                              |
|-----------------|-------------|-------------|-------------------------------------|
| /new            | POST        | CREATE      | New storage with access credentials |
| /restore        | POST        | CREATE      | Restore storage access              |    
| /:storage       | POST        | CREATE      | Add (& process) file in the storage |
| /:storage       | GET         | READ        | List of all files in the storage    |
| /:storage       | DELETE      | DELETE      | Delete storage with files           |
| /:storage/:file | DELETE      | DELETE      | Delete file from storage            |

### Run the project

##### Setup

1. Fork/Clone this repo
1. Download [Docker](https://docs.docker.com/docker-for-mac/install/) (if necessary)
1. Make sure you are using a Docker version >= 17:

    ```sh
    $ docker -v
    Docker version 17.03.0-ce, build 60ccb22
    ```

##### Build and Run the App

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
    $ docker run -it -p 5000:5000 fserver
    ```
1. Go to http://localhost:5000


##### Run tests

1. Set the Environment variable
    ```sh
    $ export NODE_ENV=test
    ```

1. With the apps up, run:

    ```sh
    $ npm run test
    ```
