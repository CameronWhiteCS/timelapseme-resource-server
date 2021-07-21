const dotenv = require('dotenv');

const dontEnvResult = dotenv.config();

if (dontEnvResult.error) {
    console.error(dontEnvResult.error);
    process.exit(1);
}

const express = require('express');
const Image = require('src/api/v1/models/Image');
const Timelapse = require('src/api/v1/models/Timelapse');

const app = express();

app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const imageRoutes = require('src/api/v1/routes/images');
app.use(imageRoutes);

const timelapseRoutes = require('src/api/v1/routes/timelapses');
app.use(timelapseRoutes);

const sequelize = require('src/api/v1/models/db');

sequelize.authenticate()
    .then(() => {
        console.log('MySQL connection has been established successfully.');
        app.listen(process.env.PORT);
        console.log(`TimeLapseMe resource server listening on port ${process.env.PORT}`);
    })
    .catch((err) => {
        console.error(`Unable to connect to MySQL database ${process.env.MYSQL_HOST}:${MYSQL_PORT}`, error);
        process.exit(1);
    });

const initModels = async () => {
    await Image.sync((err) => console.error(err));
    await Timelapse.sync((err) => console.error(err));    
};


initModels();