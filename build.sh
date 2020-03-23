screen -dm bash -c 'git pull origin $(git rev-parse --abbrev-ref HEAD); npm run env; npm run build; DEBUG=backend:* PORT=80 npm run start'
