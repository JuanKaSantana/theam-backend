const router = require('express').Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

    router.post('/login', (req, res) => {
        const email = req.sanitize(_.toLower(_.get(req.body, 'email', null)));
        const password = req.sanitize(_.get(req.body, 'password', null));

        if (!email || !password) {
            return res.status(400).json({ errorMessage: 'Email and password fields are required' });
        }

        const query = { email };

        userCollection.find(query).toArray()
            .then((result) => {
                if (result.length === 0) {
                    return res.status(400).json({ status: 'Error', errorMessage: 'Wrong credentials' });
                } else {
                    const user = result[0];
                    bcrypt.compare(password, user.password, function (err, result) {
                        if (err) {
                            return res.status(500).json({ errorMessage: err });
                        }

                        if (result === true) {
                            req.session.user = user;
                            global.req = req;
                            const tokenData = {
                                user,
                            }

                            const token = jwt.sign(tokenData, 'theam', {
                                expiresIn: 60 * 60,
                            });

                            return res.status(200).json({ status: 'OK', user, token });
                        } else {
                            return res.status(400).json({ status: 'Error', errorMessage: 'Wrong credentials' });
                        }
                    })
                }
            })
            .catch(err => res.json({ err, errorMessage: 'Something went wrong while login' }));
    });

    router.post('/signup', (req, res) => {
        const bcrypt = require('bcrypt');
        const { user } = req.body;
        const email = req.sanitize(_.get(user, 'email', null));
        const password = req.sanitize(_.get(user, 'password', null));

        if (!email || !password) {
            return res.status(400).json({ errorMessage: 'Email and password fields are required' });
        }

        _.set(user, 'email', _.toLower(email));
        const query = { email: user.email };

        userCollection.find(query).toArray()
            .then((result) => {
                if (result.length === 0) {
                    bcrypt.hash(password, 10, function (err, hash) {
                        if (err) { res.status(400).json({ errorMessage: err }) }
                        const newUser = _.merge(defaultUser, user);
                        _.set(newUser, 'password', hash);
                        userCollection.insertOne(newUser)
                            .then((response) => {
                                req.session.user = response.ops[0];
                                const tokenData = {
                                    user,
                                }
    
                                const token = jwt.sign(tokenData, 'theam', {
                                    expiresIn: 60 * 60,
                                });
                                return res.status(200).json({ user: newUser, message: 'User created successfully.', token });
                            });
                    });
                } else {
                    res.status(500).json({ errorMessage: 'User already exists.' });
                }
            })
            .catch(err => res.status(500).json({ err, errorMessage: 'Something went wrong while addind new user' }));
    });

    router.get('/secure', validateToken, function (req, res) {
        res.json({});
    });

    return router;
};
