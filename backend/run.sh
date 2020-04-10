npm install
npm run api
screen -L -dm bash -c 'DEBUG=backend:* PORT=80 npm run start'
screen -dm bash -c 'DEBUG=* npm run feeder'
