import Mocha from "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import User from "../models/User.js";
import { register, login, getUser } from "../controller/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

chai.use(chaiHttp);
chai.use(sinonChai);
chai.should();
const expect = chai.expect;

//CONTROLLER TESTS
describe("Testing User controllers", () => {
  describe(" testing register function", () => {
    let req;
    let res;
    let bcryptStub;
    let jwtSignStub;

    beforeEach(() => {
      req = {
        body: {
          email: "test@test.com",
          password: "test123",
        },
        validationResult: sinon
          .stub()
          .returns({ isEmpty: sinon.stub().returns(true) }),
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
      };

      bcryptStub = sinon.stub(bcrypt, "genSalt").resolves("salt");
      bcryptStub = sinon.stub(bcrypt, "hash").resolves("hashed_password");
      jwtSignStub = sinon.stub(jwt, "sign").returns("token");
    });

    afterEach(() => {
      sinon.restore();
    });

    it("should return 409 if email is already in use", async () => {
      sinon.stub(User, "findOne").resolves({});
      await register(req, res);
      expect(res.status.firstCall.args[0]).to.equal(409);
      expect(res.json.firstCall.args[0]).to.deep.equal({
        message: "test@test.com is already in use",
      });
    });

    it("should return 201 if user creation is successful", async () => {
      sinon.stub(User, "findOne").resolves(null);
      sinon.stub(User.prototype, "save").resolves({
        email: "test@test.com",
        password: "hashed_password",
        _id: "user_id",
      });
      await register(req, res);
      expect(res.status.firstCall.args[0]).to.equal(201);
      expect(res.json.firstCall.args[0]).to.deep.equal({
        token: "token",
        user: {
          email: "test@test.com",
          _id: "user_id",
        },
      });
    });
  });

  describe("testing login function", function () {
    let req, res;

    beforeEach(function () {
      req = {
        body: {
          email: "test@email.com",
          password: "password123",
        },
      };

      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
      };
    });

    afterEach(function () {
      sinon.restore();
    });

    it("should return an user does not exist if the email does not exist", async function () {
      sinon.stub(User, "findOne").returns(null);

      await login(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(
        res.json.calledWith({
          message: `User with email ${req.body.email} not found`,
        })
      ).to.be.true;
    });

    it("should return an error if the password is invalid", async function () {
      sinon.stub(User, "findOne").returns({ password: "hashedpassword" });
      sinon.stub(bcrypt, "compare").resolves(false);

      await login(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: "Invalid password" })).to.be.true;
    });

    it("should sign the user in if the email and password are correct", async function () {
      const user = {
        _id: "12345",
        password: "hashedpassword",
      };

      sinon.stub(User, "findOne").returns(user);
      sinon.stub(bcrypt, "compare").resolves(true);
      sinon.stub(jwt, "sign").returns("token");

      await login(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ token: "token", user: { _id: "12345" } })).to
        .be.true;
    });

    it("should return an error if there is an exception thrown", async function () {
      sinon.stub(User, "findOne").throws();

      await login(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
describe("Testing Chores controllers", () => {});
