const express = require('express');
const router = express.Router();
const requireAuthentication = require('src/api/v1/middleware/requireAuthentication');
const Image = require('src/api/v1/models/Image');
const Timelapse = require('src/api/v1/models/Timelapse');
const sequelize = require('src/db');
const videoshow = require('videoshow');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const videoOptions = {
    fps: 25,
    loop: 5, // seconds
    transition: true,
    transitionDuration: 1, // seconds
    videoBitrate: 1024,
    videoCodec: 'libx264',
    size: '640x?',
    audioBitrate: '128k',
    audioChannels: 2,
    format: 'mp4',
    pixelFormat: 'yuv420p'
}

const getFilePaths = async (transaction, userId) => {

    const imageModels = await Image.findAll({
        where: {
            owner: userId
        }
    }, { transaction });

    if(imageModels.length === 0) {
        return res.status(400).send('You don\'t have any images uploaded');
    }

    const images = [];
    imageModels.forEach((imageModel) => {
        images.push(`${process.env.UPLOAD_DIRECTORY}/${imageModel.fileName}`);
    });

    return images;

}

router.get('/api/v1/timelapses', requireAuthentication, async (req, res) => {

    const transaction = await sequelize.transaction();

    const filePaths = await getFilePaths(transaction, req.userId);

    const outputFileName = `${req.userId}`;
    const outputPath = `${process.env.TIMELAPSE_DIRECTORY}/${outputFileName}.mp4`;

    videoshow(filePaths, videoOptions)
        .save(outputPath)
        .on('error', (err, stdout, stderr) => {
            console.error('Error:', err)
            console.error('ffmpeg stderr:', stderr);
            transaction.rollback();
        })
        .on('end', async (output) => {
            await Timelapse.create({
                fileName: outputFileName,
                owner: req.userId
            }, { transaction })
            fs.readFile(outputPath, (err, data) => {
                if(err) {
                    return res.status(400).send('An error occurred while attempting to create your timelapse.');
                }
                res.type('video/mp4').status(200).send(data);
            });
        });
});

module.exports = router;