const router = require('express').Router();
const _ = require('lodash');
const validateToken = require('../_helpers/tokenValidator.js').validateToken;

module.exports = (mongoService) => {
    const imagesCollection = mongoService.collection('images');

    router.get('/download/:id', validateToken, (req, res) => {
        const id = req.sanitize(_.toLower(_.get(req.params, 'id', null)));

        if (!id) {
            return res.status(400).json();
        }

        const query = { id };

        imagesCollection.find(query).toArray()
            .then((result) => res.status(200).json(result))
            .catch(() => res.status(500).json());
    });

    router.post('/upload', validateToken, (req, response) => {
        const id = req.sanitize(_.toLower(_.get(req.body, 'id', null)));
        const image = _.get(req.body, 'image', null);

        if (!id || !image) {
            return res.status(400).json();
        }

        const query = { id };

        imagesCollection.find(query).toArray().then((res) => {
            if (res.length > 0) {
                imagesCollection.update(
                    query,
                    { $set: { image } },
                )
                    .then(result => response.status(200).json(result))
                    .catch(() => response.status(500).json());
            } else {
                imagesCollection.insert({ id, image })
                    .then(result => response.status(200).json(result))
                    .catch(() => response.status(500).json());
            }
        });
    });


    return router;
};
