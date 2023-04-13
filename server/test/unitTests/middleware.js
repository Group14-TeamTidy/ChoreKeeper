const sinon = require("sinon");
const chai = require("chai");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../../middleware/auth");

const expect = chai.expect;
describe("Middleware Tests", () => {
  describe("Verify a token", () => {
    it("should return 500 and an error message when jwt.verify throws an error", async () => {
      // Create a fake request, response, and next function
      const req = {};
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      const next = sinon.stub();

      // Stub the jwt.verify method to throw an error
      const jwtStub = sinon.stub(jwt, "verify").throws(new Error("fake error"));

      // Call the middleware function with the fake request and response objects
      await verifyToken(req, res, next);

      // Assert that the response status was 500 and the error message was returned
      expect(res.status.calledOnceWithExactly(500)).to.be.true;

      // Restore the original method
      jwtStub.restore();
    });
  });
});
