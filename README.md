# Gastar.me

### Description

## Dependencies

- Node.js v10.7, npm v6.1, Docker Compose v18.06

## Running for development

```
npm start
```

The "start" command will ran "docker-compose up" that will start up the application and a postgres for development purposes.

Then connect to the container

```
docker exec -ti gastarme_gastarme_1 bash
```

then you will need to run the migrations

```
./node_modules/.bin/sequelize db:migrate
```

and the seeds for the admin user, his credentials are:

E-mail: admin@gastar.me 
Password: admin

```
./node_modules/.bin/sequelize db:seed:all
```

## For production

For production you will need to set the following environment variables

```
GASTARME_JWT_SECRET=
GASTARME_DB_DATABASE=
GASTARME_DB_USERNAME=
GASTARME_DB_PASSWORD=
GASTARME_DB_HOST=
GASTARME_DB_PORT=
```

## Tests

Inside the container, run:

```
npm run test
```
