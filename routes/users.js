const router = require('express').Router();
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const validateToken = require('../_helpers/tokenValidator.js').validateToken;

module.exports = (mongoService) => {
    const userCollection = mongoService.collection('users');

    const defaultUser = {
        email: '',
        password: '',
        admin: false,
        creationDate: moment().format().split('T')[0],
    };

    router.get('/search/:id', validateToken, (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json();
        }
        if (id.length !== 24) {
            return res.status(422).json();
        }
        const query = {
            _id: ObjectID(req.sanitize(id)),
        };

        userCollection.find(query).toArray()
            .then(result => res.status(200).json({ user: result[0] }))
            .catch(() => res.status(500).json());
    });

    router.get('/search', validateToken, (req, res) => {
        userCollection.find().toArray()
            .then(result => res.status(200).json({ users: result }))
            .catch(() => res.status(500).json());
    });

    router.post('/', validateToken, (req, res) => {
        const bcrypt = require('bcrypt');
        const { user } = req.body;
        const email = _.get(user, 'email', null);
        const password = _.get(user, 'password', null);

        if (!email || !password) {
            return res.status(400).json();
        }

        _.set(user, 'email', _.toLower(email));
        Object.keys(user).forEach((key) => {
            user[key] = req.sanitize(user[key]);
        });

        const query = { email: user.email };

        userCollection.find(query).toArray()
            .then((result) => {
                if (result.length === 0) {
                    bcrypt.hash(password, 10, function (err, hash) {
                        if (err) { res.status(500).json() }
                        const exampleUser = {
                            email: '',
                            password: '',
                            admin: false,
                            creationDate: moment().format().split('T')[0],
                        };
                        const newUser = _.merge(exampleUser, user);
                        _.set(newUser, 'password', hash);
                        userCollection.insert(newUser)
                            .then(() => res.status(200).json({ user: newUser, message: 'User created successfully.' }));
                    });
                } else {
                    res.status(409).json();
                }
            })
            .catch(() => res.status(500).json());
    });

    router.put('/', validateToken, (req, res) => {
        const { id, changeValues } = req.body;

        if (!id || !changeValues) {
            return res.status(400).json();
        }

        if (id.length !== 24) {
            return res.status(422).json();
        }

        const selectBy = {
            _id: ObjectID(id),
        };

        delete changeValues._id;

        Object.keys(changeValues).forEach((key) => {
            changeValues[key] = req.sanitize(changeValues[key]);
        });

        userCollection.update(
            selectBy,
            { $set: changeValues },
        )
            .then(result => res.status(200).json(result))
            .catch(() => res.status(500).json());
    });


    router.delete('/:id', validateToken, (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json();
        }

        if (id.length !== 24) {
            return res.status(422).json();
        }

        const query = {
            _id: ObjectID(req.sanitize(id)),
        };

        try {
            userCollection.deleteOne(query)
                .then(res.status(200).json({ message: 'User deleted successfully.' }))
        } catch (e) {
            res.status(500).json();
        }
    });

    return router;
};
