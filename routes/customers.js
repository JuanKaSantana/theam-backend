const router = require('express').Router();
const _ = require('lodash');
const moment = require('moment');
const ObjectID = require('mongodb').ObjectID;
const validateToken = require('../_helpers/tokenValidator.js').validateToken;

module.exports = (mongoService) => {
    const customerCollection = mongoService.collection('customers');
    const defaultCustomer = {
        id: "",
        name: "",
        surname: "",
        creator: '',
        lastUpdater: "",
        creationDate: moment().format().split('T')[0],
    };

    router.get('/search/:id', validateToken, function (req, res) {
        const { id } = req.params;

        if (id.length !== 24) {
            return res.status(422).json({ errorMessage: 'Invalid Id' });
        }

        const query = {
            _id: ObjectID(req.sanitize(id)),
        };

        customerCollection.find(query).toArray()
            .then(result => res.status(200).json({ customer: result[0] }))
            .catch(() => res.status(500).json({ user: {}, errorMessage: "Something went wrong while getting customers." }));
    });

    router.get('/search', validateToken, function (req, res) {
        customerCollection.find().toArray()
        .then((result) => {
            if (result.length > 0) {
                res.status(200).json({ customers: result });
            } else {
                res.status(200).json({ customers: {}, errorMessage: "No customers found." });
            }
        })
        .catch(err => res.status(500).json({ customers: {}, errorMessage: err }));
    });

    router.post('/', validateToken, (req, res) => {
        const { customer } = req.body;
        const id = _.get(customer, 'id', null);
        const name = _.get(customer, 'name', null);
        const surname = _.get(customer, 'surname', null);

        if (!id || !name || !surname) {
            return res.status(400).json({ errorMessage: 'Id, name and surname fields are required' });
        }

        _.set(customer, 'id', _.toLower(id));

        const query = { id: customer.id };

        Object.keys(customer).forEach((key) => {
            customer[key] = req.sanitize(customer[key]);
        });

        customerCollection.find(query).toArray()
            .then((result) => {
                if (result.length === 0) {
                    const newCustomer = _.merge(defaultCustomer, customer);
                    const idUser = _.get(global, 'req.session.user._id', null);
                    if (idUser) {
                        newCustomer.creator = idUser;
                    }
                    customerCollection.insert(newCustomer)
                        .then(() => res.status(200).json({ customer: newCustomer, message: 'Customer created successfully.' })); 
                } else {
                    res.status(500).json({ errorMessage: 'Customer already exists.' });
                }
                
            })
            .catch(err => res.status(500).json({ errorMessage: err }));
    });

    router.put('/', validateToken, (req, res) => {
        let { id, changeValues } = req.body;

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

        const userId = _.get(global, 'req.session.user._id', null);
        if (userId) {
            changeValues.lastUpdater = global.req.session.user._id;
        }

        customerCollection.update(
            selectBy,
            { $set: changeValues },
        )
            .then(result => res.status(200).json(result))
            .catch(err => res.status(500).json(err));
    });


    router.delete('/:id', validateToken, (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ errorMessage: 'Id field is required' });
        }

        if (id.length !== 24) {
            return res.status(422).json({ errorMessage: 'Invalid Id' });
        }

        const query = {
            _id: ObjectID(req.sanitize(id)),
        };

        try {
            customerCollection.deleteOne(query)
                .then(res.status(200).json({ message: 'Customer deleted successfully.' }));
        } catch (e) {
            res.status(500).json({ errorMessage: 'Something went wrong while deleting a customer' });
        }
    });

    return router;
};
