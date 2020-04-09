screen -L -dm bash -c 'npm install && npm run api && DEBUG=backend:* PORT=80 npm run start'
screen -dm bash -c 'DEBUG=* npm run feeder'