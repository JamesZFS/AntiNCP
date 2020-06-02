npm install
npm run api
screen -dm bash -c 'INIT_CLF=1 python3 topic/server.py'
screen -dm bash -c 'DEBUG=* npm run feeder'
screen -L -dm bash -c 'DEBUG=backend:* PORT=80 npm run start'
