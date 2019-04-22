#!/usr/bin/env node
'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressSanitizer = require('express-sanitizer');

module.exports = (mongoService) => {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(expressSanitizer());
    app.use(cookieParser());
    app.use(session({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 60000,
        },
    }))

    app.use('/users', require('./routes/users')(mongoService));
    app.use('/customers', require('./routes/customers')(mongoService));
    app.use('/auth', require('./routes/auth')(mongoService));
    app.use('/images', require('./routes/images')(mongoService));

    return app;
};