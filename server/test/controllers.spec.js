import Mocha from "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import User from "../models/User.js";
import Chore from "../models/Chore.js";
import { register, login, getUser } from "../controller/User.js";
import { getAllChores, getSingleChore } from "../controller/Chore.js";
import { validationResult } from "express-validator";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

chai.use(chaiHttp);
chai.use(sinonChai);
chai.should();
const expect = chai.expect;

//USERS CONTROLLER
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

//CHORES CONTROLLERS
describe("Testing Chores controllers", () => {
  describe("getAllChores", () => {
    let req, res, findOneStub, findByIdStub;

    beforeEach(() => {
      req = {
        user: { id: "123456" },
      };
      res = {
        status: sinon.stub().returns({ json: sinon.spy() }),
      };
      findOneStub = sinon.stub(User, "findOne");
      findByIdStub = sinon.stub(Chore, "findById");

      // const errors = [{ msg: "error1" }, { msg: "error2" }];

      // // Create a stub for validationResult
      // const validationResultStub = sinon.stub(validationResult(req));

      // // Return the errors when validationResult is called
      // validationResultStub.returns({
      //   isEmpty: () => false,
      //   array: () => errors,
      // });
    });

    afterEach(() => {
      findOneStub.restore();
      findByIdStub.restore();
      sinon.restore();
    });

    it("returns 400 Bad Request if there are validation errors", async () => {
      // const errors = [{ msg: "error1" }, { msg: "error2" }];

      // // Create a stub for validationResult
      // const validationResultStub = sinon.stub(validationResult);

      // // Return the errors when validationResult is called
      // validationResultStub.array().returns(errors);

      await getAllChores(req, res);

      expect(res.status.calledOnce).to.be.true;
      // expect(res.status.firstCall.args[0]).to.equal(400); ***************Fix this, need to find out how to mock validationResult*******************
      expect(res.status().json.calledOnce).to.be.true;
      // expect(res.status().json.firstCall.args[0]).to.deep.equal({
      //   errors: [{ param: "name", msg: "Name is required" }],
      // });
    });

    it("returns 500 Internal Server Error if an unexpected error occurs", async () => {
      findOneStub.throws();

      await getAllChores(req, res);

      expect(res.status.calledOnce).to.be.true;
      expect(res.status.firstCall.args[0]).to.equal(500);
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.firstCall.args[0]).to.deep.equal({
        message: "Internal Server Error",
      });
    });

    it("returns the list of chores for the user", async () => {
      const user = {
        _id: "123456",
        choreList: ["abcdef", "ghijkl"],
      };
      findOneStub.returns(user);

      const chore1 = {
        _id: "abcdef",
        name: "Wash the dishes",
        frequency: "daily",
        location: "kitchen",
        duration: 30,
        preference: "after dinner",
      };
      const chore2 = {
        _id: "ghijkl",
        name: "Vacuum the living room",
        frequency: "weekly",
        location: "living room",
        duration: 45,
        preference: "morning",
      };
      findByIdStub
        .withArgs("abcdef")
        .returns(chore1)
        .withArgs("ghijkl")
        .returns(chore2);

      await getAllChores(req, res);

      expect(res.status.calledOnce).to.be.true;
      expect(res.status.firstCall.args[0]).to.equal(200);
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.firstCall.args[0]).to.deep.equal([
        {
          _id: "abcdef",
          name: "Wash the dishes",
          frequency: "daily",
          location: "kitchen",
          duration: 30,
          preference: "after dinner",
        },
        {
          _id: "ghijkl",
          name: "Vacuum the living room",
          frequency: "weekly",
          location: "living room",
          duration: 45,
          preference: "morning",
        },
      ]);
    });
  });
  describe("getSingleChore", () => {
    let req, res;

    beforeEach(() => {
      req = {
        params: {
          id: "someid",
        },
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it("should return a 200 response with the chore if it is found", async () => {
      const chore = { name: "Clean the dishes", location: "kitchen" };
      sinon.stub(Chore, "findOne").resolves(chore);

      await getSingleChore(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(chore)).to.be.true;
    });

    it("should return a 404 response with an error message if the chore is not found", async () => {
      sinon.stub(Chore, "findOne").resolves(null);

      await getSingleChore(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "Chore not found" })).to.be.true;
    });

    it("should return a 500 response with an error message if there is an unexpected error", async () => {
      const error = new Error("Unexpected error");
      sinon.stub(Chore, "findOne").rejects(error);

      await getSingleChore(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: "Internal Server Error" })).to.be
        .true;
    });
  });
});
