const chai = require('chai');
const request = require('supertest');
const chaiHttp = require('chai-http');
const mockMongo = require('./testHelper');
let app;

chai.use(chaiHttp);

beforeEach(function () {
    app = require('../app')(mockMongo);
});

describe('Customers routes', () => {
    describe('GET', () => {
        it('should return 200 on /search', (done) => {
            request(app)
                .get('/customers/search')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should return 200 on /search/:id', (done) => {
            request(app)
                .get('/customers/search/123123123123123123123111')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should return 422 on /search/:id if id is not valid', (done) => {
            request(app)
                .get('/customers/search/123')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(422, done);
        });
    });

    describe('POST', () => {
        it('should return 200 on /', (done) => {
            request(app)
                .post('/customers')
                .send({ customer: { id: 'pa',  name: 'pe', surname: 'pi' }})
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should return 400 on / if no user', (done) => {
            request(app)
                .post('/customers')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe('PUT', () => {
        it('should return 200 on /', (done) => {
            request(app)
                .put('/customers')
                .send({ id: '123123123123123123123111', changeValues: { name: 'newName' }})
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should return 400 on / if id or changeValues', (done) => {
            request(app)
                .put('/customers')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done);
        });
    });

    describe('DELETE', (done) => {
        it('should return 200 on /:id', () => {
            request(app)
                .delete('/customers')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });
});