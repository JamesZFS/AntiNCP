npm install
npm run api
screen -dm bash -c 'npm run topic'
screen -dm bash -c 'DEBUG=* npm run feeder'
screen -L -dm bash -c 'DEBUG=backend:* PORT=80 npm run start'
