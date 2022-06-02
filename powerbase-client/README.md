# Powerbase Client

Powerbase's client that is built with ReactJS and TailwindCSS.

## Installation

1. Clone Powerbase's core repository

```bash
git clone https://github.com/Group-One-Technology/powerbase-core.git
```

2. Go to the client's directory and install the dependencies

```bash
cd powerbase-client

yarn
```

3. Copy and rename `.env.example` to `.env`, then update the variables.

4. Run the app and you're all set!

```bash
yarn dev
```

## Updating Docker Image on Docker Hub

1. Build the image with the updated tag:

```
docker build -t jorenrui/powerbase-client:0.1.0 . --no-cache
```

2. Then you may push the docker image to docker hub.