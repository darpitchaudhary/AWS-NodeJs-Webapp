var expect  = require('chai').expect;
var request = require('request');

describe("Should Check for the login page", function () {
    it("Should Check for the login page", function (done) {
        request('/', function(error, response, body) {
            expect(body).to.not.be.null;
            done();
        });
    });
})