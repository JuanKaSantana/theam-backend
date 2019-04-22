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
        if (id.length !== 24) {
            return res.status(422).json({ errorMessage: 'Invalid Id' });
        }
        const query = {
            _id: ObjectID(req.sanitize(id)),
        };

        userCollection.find(query).toArray()
            .then(result => res.status(200).json({ user: result[0] }))
            .catch(() => res.status(500).json({ user: {}, errorMessage: "Something went wrong while getting users." }));
    });

    router.get('/search', validateToken, (req, res) => {
        userCollection.find().toArray()
            .then((result) => {
                if (result.length > 0) {
                    res.status(200).json({ users: result });
                } else {
                    res.status(200).json({ users: {}, errorMessage: "No users found." });
                }
            })
            .catch(() => res.status(500).json({ users: {}, errorMessage: "Something went wrong while getting users." }));
    });

    router.post('/', validateToken, (req, res) => {
        const bcrypt = require('bcrypt');
        const { user } = req.body;
        const email = _.get(user, 'email', null);
        const password = _.get(user, 'password', null);

        if (!email || !password) {
            return res.status(400).json({ errorMessage: 'Email and password fields are required' });
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
                        if (err) { res.json({ errorMessage: err }) }
                        const newUser = _.merge(defaultUser, user);
                        _.set(newUser, 'password', hash);
                        userCollection.insert(newUser)
                            .then(() => res.status(200).json({ user: newUser, message: 'User created successfully.' }));
                    });
                } else {
                    res.status(500).json({ errorMessage: 'User already exists.' });
                }
            })
            .catch(err => res.status(500).json({ err, errorMessage: 'Something went wrong while addind new user' }));
    });

    router.put('/', validateToken, (req, res) => {
        const { id, changeValues } = req.body;

        if (!id || !changeValues) {
            return res.status(400).json({ errorMessage: 'id and changeValues fields are required' })
        }

        if (id.length !== 24) {
            return res.status(422).json({ errorMessage: 'Invalid Id' });
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
            .then(result => res.json(result))
            .catch(err => res.json(err));
    });


    router.delete('/:id', validateToken, (req, res) => {
        const { id } = req.params;

        if (id.length !== 24) {
            return res.status(422).json({ errorMessage: 'Invalid Id' });
        }

        const query = {
            _id: ObjectID(req.sanitize(id)),
        };

        try {
            userCollection.deleteOne(query)
                .then(res.status(200).json({ message: 'User deleted successfully.' }))
        } catch (e) {
            res.status(500).json({ errorMessage: 'Something went wrong while deleting a user' });
        }
    });

    return router;
};
