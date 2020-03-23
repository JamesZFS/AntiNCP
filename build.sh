screen -L -dm bash -c 'git pull origin dev; npm run env; npm run build; DEBUG=backend:* PORT=80 npm run start'
