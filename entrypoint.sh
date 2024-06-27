cd /app/server

touch env
cat env > .env

cd lib
exec node --enable-source-maps index.js