const chai = require('chai');
const request = require('supertest');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mockMongo = require('./testHelper');
let app;
let tokenValidator;

chai.use(chaiHttp);

beforeEach(function () {
    tokenValidator = require('../_helpers/tokenValidator');;
    sinon.stub(tokenValidator, 'validateToken')
        .callsFake(function (req, res, next) {
            return next();
        });
    app = require('../app')(mockMongo);
});

afterEach(function () {
    tokenValidator.validateToken.restore();
});

describe('Auth routes', () => {
    describe('POST', (done) => {
        it('should return 400 on /login if no email or pw', () => {
            request(app)
                .post('/login')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('should return 400 on /login if incorrect credentials', () => {
            request(app)
                .post('/login')
                .send({ email: 'email', password: 'password' })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('should return 200 on /login if proper credentials', () => {
            request(app)
                .post('/login')
                .send({ email: '1', password: '1' })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should return 400 on /signup if proper data', () => {
            request(app)
                .post('/signup')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('should return 500 on /signup if user exists', () => {
            request(app)
                .post('/signup')
                .send({ user: { email: '1', password: '1' } })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(500, done);
        });

        it('should return 200 on /signup if proper data', () => {
            request(app)
                .post('/signup')
                .send({ user: { email: 'example', password: 'example123' } })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });

    describe('GET', (done) => {
        it('should call next if token', () => {
            request(app)
                .get('/secure')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });
});
