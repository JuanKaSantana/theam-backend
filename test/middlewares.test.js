const jwt = require('jsonwebtoken');
const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const validateToken = require('../_helpers/tokenValidator').validateToken;

const mockRes = {
    status: () => ({
        json: res => res,
    }),
}
const next = () => 'OK';
let mockReq = {
    headers: {
        authorization: null,
    },
};

chai.use(chaiHttp);

describe('Middlewares', () => {
    describe('Validate Token', () => {
        it('should return invalid token if not token passed', (done) => {
            const response = validateToken(mockReq, mockRes);
            expect(response).to.deep.include({ error: 'Invalid token' });
            done();
        });

        it('should return invalid token if invalid token passed', (done) => {
            mockReq.headers.authorization = 'invlid token';
            const response = validateToken(mockReq, mockRes);
            expect(response).to.deep.include({ error: 'Invalid token' });
            done();
        });

        it('should call next function if valid token passed', (done) => {
            const tokenData = {
                message: 'secure',
            }
            const token = jwt.sign(tokenData, 'theam', {
                expiresIn: 60 * 60,
            });
            

            mockReq.headers.authorization = token;
            const response = validateToken(mockReq, mockRes, next);
            expect(response).to.equal('OK');
            done();
        });
    });
});