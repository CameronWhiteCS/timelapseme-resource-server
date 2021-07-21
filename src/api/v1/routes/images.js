const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Sequelize } = require('sequelize');
const sequelize = require('src/db');
const requireAuthentication = require('src/api/v1/middleware/requireAuthentication');
const Image = require('src/api/v1/models/Image');
const fs = require('fs');

/**
 * used as a whitelist of permitted MIME types to prevent malicious
 * clients from arbitrarily setting a potentially dangerous MIME type
 * @param {*} mimeType 
 * @returns 
 */
const filterMimeType = (mimeType) => {
    const ALLOWED_TYPES = [
        'image/png',
        'image/jpeg'
    ];
    if (ALLOWED_TYPES.includes(mimeType)) {
        return mimeType;
    } else {
        return ''
    }

}

const upload = multer({
    dest: process.env.UPLOAD_DIRECTORY
});

router.post('/api/v1/images', requireAuthentication, upload.single('image'), async (req, res) => {

    if (!req.file) return res.status(400).send('Error: image not provided.');

    try {
        await Image.create({
            fileName: `${req.file.filename}`,
            mimeType: req.file.mimetype,
            owner: req.userId
        });
        return res.status(200).send();
    } catch (err) {
        console.error(err);
        res.status(400).send('An error occurred while attempting to upload this file.');
    }

});

router.get('/api/v1/images/user/:userId/page/:page', requireAuthentication, async (req, res) => {

    if (parseInt(req.params.userId) !== req.userId) {
        return res.status(403).send('You are not authorized to access this resource.');
    }

    let page = parseInt(req.params.page);
    if (!page) {
        return res.status(400).send('Page number invalid.');
    }

    if (page === 0) page = 1;

    const ITEMS_PER_PAGE = 25;

    const query = {
        where: {
            owner: req.userId,
        },
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
        order: [
            ['createdAt', 'desc']
        ]
    }

    const after = parseInt(req.query.after);
    const before = parseInt(req.query.before);

    if (!isNaN(after) || !isNaN(before)) {
        query.where.createdAt = {};
        if (!isNaN(after)) {
            query.where.createdAt[Sequelize.Op.gte] = new Date(after);
        }
        if (!isNaN(before)) {
            query.where.createdAt[Sequelize.Op.lte] = new Date(before);
        }

    }

    const images = await Image.findAll(query);

    const output = [];
    images.forEach((img) => output.push(img.id));

    res.status(200).json(output);
});

router.get('/api/v1/images/:id', requireAuthentication, async (req, res) => {

    const image = await Image.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!image) {
        res.status(404).send('Image not found.');
    }

    if (image?.owner !== req.userId) {
        return res.status(403).send('You are not authorized to access that resource.')
    }

    res.type(filterMimeType(image.mimeType)).sendFile(`${process.env.UPLOAD_DIRECTORY}/${image.fileName}`);

});

router.delete('/api/v1/images/:id', requireAuthentication, async (req, res) => {
    const imageId = parseInt(req.params.id);
    if (!imageId) return res.status(400).send('Invalid ID');

    const image = await Image.findOne({
        where: {
            id: imageId
        }
    })

    if (!image) return res.status(404).send('Image not found');

    if (image.owner !== req.userId) {
        return res.status(403).send('You do not have permission to delete this image.');
    }

    const transaction = await sequelize.transaction();

    try {

        await Image.destroy({
            where: {
                id: imageId
            }
        }, { transaction });

        fs.unlink(`${process.env.UPLOAD_DIRECTORY}/${image.fileName}`, () => {
            res.status(200).send('');
        });

    } catch (err) {
        console.error(err);
        transaction.rollback();
        return res.status(400).send('An errorr occurred while attempting to delete this image.');
    }

});

module.exports = router;

