const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const User = require("../../models/User");
const Chore = require("../../models/Chore");
const { register, login, setNotifs } = require("../../controller/user");

const {
  getAllChores,
  createChore,
  editChore,
  getSingleChore,
  deleteChore,
  checkOffChore,
} = require("../../controller/chore");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createSchedule } = require("../../controller/schedule.js");

chai.use(chaiHttp);
chai.use(sinonChai);
chai.should();
const expect = chai.expect;

//USERS CONTROLLER
describe("Testing User controllers", function () {
  describe(" testing register function", function () {
    let req;
    let res;
    let bcryptStub;
    let jwtSignStub;

    beforeEach(() => {
      // Create a request
      req = {
        body: {
          email: "test@test.com",
          password: "test123",
        },
        // Mock the validation result to always return true
        validationResult: sinon
          .stub()
          .returns({ isEmpty: sinon.stub().returns(true) }),
      };
      // Create a response for the request
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
      };

      // Stubbing the encryption functions
      bcryptStub = sinon.stub(bcrypt, "genSalt").resolves("salt");
      bcryptStub = sinon.stub(bcrypt, "hash").resolves("hashed_password");
      jwtSignStub = sinon.stub(jwt, "sign").returns("token");
    });

    afterEach(() => {
      // Restore all the stubbed functions
      sinon.restore();
    });

    it("should return 409 if email is already in use", async function () {
      // Stub the mongoose findOne functoin to always return true
      sinon.stub(User, "findOne").resolves({});

      await register(req, res);
      expect(res.status.firstCall.args[0]).to.equal(409);
      expect(res.json.firstCall.args[0]).to.deep.equal({
        message: "test@test.com is already in use",
      });
    });

    it("should return 201 if user creation is successful", async function () {
      // Stub the mongoose findOne function to always return null
      sinon.stub(User, "findOne").resolves(null);

      // Stub the mongoose save function to return a new user
      sinon.stub(User.prototype, "save").resolves({
        email: "test@test.com",
        password: "hashed_password",
        _id: "user_id",
        toObject: () => {
          return {
            email: "test@test.com",
            password: "hashed_password",
            _id: "user_id",
          };
        },
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
    it("should return an error if there is an exception thrown", async function () {
      // Testing error handling

      sinon.stub(User, "findOne").throws();

      await register(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("testing login function", function () {
    let req, res;

    beforeEach(function () {
      // Create a request

      req = {
        body: {
          email: "test@email.com",
          password: "password123",
        },
      };
      // Mock the validation result to always return true

      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
      };
    });

    afterEach(function () {
      // Restore all the stubbed functions
      sinon.restore();
    });

    it("should return a user does not exist if the email does not exist", async function () {
      // Stub the mongoose findOne functoin to return null
      sinon.stub(User, "findOne").returns(null);

      // Call the function we are testing
      await login(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(
        res.json.calledWith({
          message: `User with email ${req.body.email} not found`,
        })
      ).to.be.true;
    });

    it("should return an error if the password is invalid", async function () {
      // Stub the mongoose findOne functoin to return an invalid passsword

      sinon.stub(User, "findOne").returns({ password: "hashedpassword" });

      // Stub the btcrypt to make it return false
      sinon.stub(bcrypt, "compare").resolves(false);

      await login(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: "Invalid password" })).to.be.true;
    });

    it("should sign the user in if the email and password are correct", async function () {
      const user = {
        _id: "12345",
        password: "hashedpassword",
        toObject: () => {
          return { _id: "12345", password: "hashedpassword" };
        },
      };

      sinon.stub(User, "findOne").returns(user);

      // Stub the btcrypt to make it return true
      sinon.stub(bcrypt, "compare").resolves(true);
      // Fake a return token
      sinon.stub(jwt, "sign").returns("token");

      await login(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ token: "token", user: { _id: "12345" } })).to
        .be.true;
    });

    it("should return an error if there is an exception thrown", async function () {
      // Testing error handling

      sinon.stub(User, "findOne").throws();

      await login(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("setNotifs function", () => {
    let req;
    let res;

    beforeEach(() => {
      req = {
        body: {
          receiveNotifs: true,
        },
        user: {
          id: "1234",
        },
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it("should set the user notifications setting and return the updated user object", async () => {
      const user = {
        _id: "1234",
        name: "John",
        email: "john@example.com",
        receiveNotifs: false,
        toObject: () => ({
          _id: "1234",
          name: "John",
          email: "john@example.com",
          receiveNotifs: true,
        }),
        save: sinon.stub(),
      };

      sinon.stub(User, "findOne").resolves(user);

      await setNotifs(req, res);

      expect(User.findOne.calledOnceWith({ _id: req.user.id })).to.be.true;
      expect(user.receiveNotifs).to.be.true;
      expect(user.save.calledOnce).to.be.true;
      expect(res.status.calledOnceWith(201)).to.be.true;
      expect(res.json.calledOnceWith({ user: user.toObject() })).to.be.true;
    });

    it("should return a 400 error if receiveNotifs is not a boolean value", async () => {
      const user = {
        _id: "123ss4",
        name: "Nonamer",
        email: "Nonamer@example.com",
        receiveNotifs: false,
      };
      let badReq = {
        body: {
          receiveNotifs: "a none boolean",
        },
        user: {
          id: "1234",
        },
      };
      sinon.stub(User, "findOne").resolves(user);

      await setNotifs(badReq, res);

      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(
        res.json.calledOnceWith({
          message: "Cannot set notifications to a none boolean",
        })
      ).to.be.true;
    });
    it("should return a 401 error if the user does not exist", async () => {
      sinon.stub(User, "findOne").resolves(null);

      await setNotifs(req, res);

      expect(User.findOne.calledOnceWith({ _id: req.user.id })).to.be.true;
      expect(res.status.calledOnceWith(401)).to.be.true;
      expect(res.json.calledOnceWith({ message: "This User does not exist" }))
        .to.be.true;
    });

    it("should return a 500 error if there is an error during the process", async () => {
      sinon.stub(User, "findOne").throws();

      await setNotifs(req, res);

      expect(User.findOne.calledOnceWith({ _id: req.user.id })).to.be.true;
      expect(res.status.calledOnceWith(500)).to.be.true;
      expect(
        res.json.calledOnceWith({
          message: "Could not change notification settings.",
        })
      ).to.be.true;
    });
  });
});

//CHORES CONTROLLERS

describe("Testing Chores controllers", () => {
  describe("createChore", () => {
    let req;
    let res;
    let sandbox;
    beforeEach(() => {
      // Using createSandbox so that I can easily stub functions
      sandbox = sinon.createSandbox();

      // Create the request
      req = {
        body: {
          name: "Clean the kitchen",
          frequency: { quantity: 2, interval: "days" },
          location: "Kitchen",
          duration: 30,
          preference: "High",
        },
        user: { id: "user123" },
      };

      // Create the response object
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
    });
    afterEach(() => {
      sandbox.restore();
    });

    it("returns 409 status code if chore already exists", async () => {
      // stub the  mongoose findOne function to return a valid response
      sandbox.stub(Chore, "findOne").returns({});

      await createChore(req, res);
      // Checks
      expect(res.status.calledWith(409)).to.be.true;
      expect(
        res.json.calledWith({
          message:
            "Chore: Clean the kitchen already exists. If you want to change somthing, please use the EDIT option.",
        })
      ).to.be.true;
    });

    it("returns 500 status code if an error occurs while saving chore", async () => {
      // Stub the  mongoose findOne function to return an invalid response
      sandbox.stub(Chore, "findOne").returns(null);

      // Testing error handling
      sandbox.stub(Chore.prototype, "save").throws();
      await createChore(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: "Chore could not be created" })).to
        .be.true;
    });

    it("returns 201 status code and the saved chore object if the chore is successfully created", async () => {
      // Stub the  mongoose findOne function to return a valid null

      sandbox.stub(Chore, "findOne").returns(null);
      sandbox.stub(User, "findOne").returns({
        email: "test@test.com",
        password: "1234",
        chores: [],
        save: sandbox.stub().resolves(),
      });
      sandbox.stub(Chore.prototype, "save").returns({
        _id: "chore123",
        name: "Clean the kitchen",
        frequency: { quantity: 2, interval: "days" },
        location: "Kitchen",
        duration: 30,
        preference: "High",
      });

      await createChore(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(
        res.json.calledWith({
          Chore: {
            _id: "chore123",
            name: "Clean the kitchen",
            frequency: { quantity: 2, interval: "days" },
            location: "Kitchen",
            duration: 30,
            preference: "High",
          },
        })
      ).to.be.true;
    });
  });
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
    });

    afterEach(() => {
      findOneStub.restore();
      findByIdStub.restore();
      sinon.restore();
    });

    it("should return an error if there is an exception thrown", async function () {
      // Testing error handling

      findOneStub.throws();

      await getAllChores(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });

    it("should return all chores for a user", async () => {
      const user = {
        _id: "123456",
        chores: ["abcdef", "ghijkl"],
      };
      findOneStub.returns(user);

      const chore1 = {
        _id: "abcdef",
        name: "Wash the dishes",
        frequency: "daily",
        location: "kitchen",
        duration: 30,
        preference: "after dinner",
        lastCheckedOff: [],
        nextOccurrence: 987654321,
      };
      const chore2 = {
        _id: "ghijkl",
        name: "Vacuum the living room",
        frequency: "weekly",
        location: "living room",
        duration: 45,
        preference: "morning",
        lastCheckedOff: [],
        nextOccurrence: 123456789,
      };
      // Create a stub for the Chore model
      const choreStub = sinon.stub(Chore, "find");

      // Set the stub to return a predefined list of chores
      choreStub
        .withArgs({ _id: { $in: user.chores } })
        .returns([chore1, chore2]);

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
          lastCheckedOff: [],
          nextOccurrence: 987654321,
        },
        {
          _id: "ghijkl",
          name: "Vacuum the living room",
          frequency: "weekly",
          location: "living room",
          duration: 45,
          preference: "morning",
          lastCheckedOff: [],
          nextOccurrence: 123456789,
        },
      ]);
    });
  });

  describe("editChore", () => {
    let res, findOneStub, sandbox;
    beforeEach(() => {
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };
      findOneStub = sinon.stub(Chore, "findOne");
      sandbox = sinon.createSandbox();
      sandbox.stub(Chore.prototype, "save").returns({
        _id: "chore123",
        name: "Clean the kitchen",
        frequency: { quantity: 2, interval: "days" },
        location: "Kitchen",
        duration: 30,
        preference: "High",
        lastCheckedOff: [9484839483],
        nextOccurrence: 847578493,
      });
    });

    afterEach(() => {
      findOneStub.restore();
      sinon.restore();
      sandbox.restore();
    });
    it("should return edited chore", async () => {
      const id = "123";
      const req = {
        params: { id },
        body: {
          name: "Clean the kitchen",
          frequency: { quantity: 2, interval: "days" },
          location: "kitchen",
          duration: "30",
          preference: "low",
        },
      };

      findOneStub.resolves(req.body);

      await editChore(req, res);

      expect(findOneStub.calledOnceWith({ _id: id })).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("returns 201 status code and the saved chore object if the chore is successfully edited", async () => {
      findOneStub.returns({
        _id: "chore123",
        name: "Clean the kitchen",
        frequency: { quantity: 2, interval: "days" },
        location: "Kitchen",
        duration: 30,
        preference: "High",
        lastCheckedOff: [9484839483],
        save: sandbox.stub().resolves(),
      });

      const id = "123";
      const req = {
        params: { id },
        body: {
          name: "Clean the kitchen",
          frequency: {
            quantity: 1,
            interval: "weeks",
          },
          location: "kitchen",
          duration: "30",
        },
      };

      await editChore(req, res);
      expect(res.status.calledWith(201)).to.be.true;
    });
    it("should use creation time as reference time if last checked off array is empty", async () => {
      const fakeTimestamp = new Date(); // set your fake timestamp here

      findOneStub.returns({
        _id: {
          id: "ch123",
          getTimestamp: sandbox.stub().resolves(fakeTimestamp),
        },
        name: "Clean the kitchen",
        frequency: { quantity: 2, interval: "days" },
        location: "Kitchen",
        duration: 30,
        preference: "High",
        lastCheckedOff: [],
        save: sandbox.stub().resolves(),
      });

      const req = {
        params: { id: "ch123" },
        body: {
          name: "Clean the kitchen",
          frequency: {
            quantity: 1,
            interval: "weeks",
          },
          location: "kitchen",
          duration: "30",
        },
      };

      await editChore(req, res);
      expect(res.status.calledWith(201)).to.be.true;
    });
    it("should return 404 if chore is not found", async () => {
      const id = "456";
      const req = { params: { id }, body: {} };

      findOneStub.resolves(null);

      await editChore(req, res);

      expect(findOneStub.calledOnceWith({ _id: id })).to.be.true;
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(
        res.json.calledOnceWith({
          message: `Chore with id ${id} was not found`,
        })
      ).to.be.true;
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const id = "789";
      const req = { params: { id }, body: {} };

      const error = new Error("Unexpected error");
      findOneStub.throws(error);

      await editChore(req, res);

      expect(findOneStub.calledOnceWith({ _id: id })).to.be.true;
      expect(res.status.calledOnceWith(500)).to.be.true;
      expect(res.json.calledOnceWith({ message: "Internal Server Error" })).to
        .be.true;
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

  describe("deleteChore", () => {
    let id, req, res, findByIdAndDelete, findOneStub, sandbox;
    beforeEach(() => {
      id = "123";
      req = {
        params: { id },
        user: { id: "123456" },
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };
      sandbox = sinon.createSandbox();

      findByIdAndDelete = sandbox.stub(Chore, "findByIdAndDelete");
      findOneStub = sandbox.stub(User, "findOne");
    });

    afterEach(() => {
      findByIdAndDelete.restore();
      sandbox.restore();
      sinon.restore();
    });

    // Test 1
    it("should return message containing deleted chore id", async () => {
      findByIdAndDelete.resolves(req.params);
      findOneStub.resolves({
        id: "123456",
        email: "noname@gmail.com",
        chores: [{ _id: { toString: sandbox.stub().returns(id) } }],
        save: sandbox.stub().resolves(),
      });

      await deleteChore(req, res);

      expect(findByIdAndDelete.calledOnceWith({ _id: id })).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
    });

    // Test 2
    it("should return 500 if an unexpected error occurs", async () => {
      const error = new Error("Unexpected error");
      findByIdAndDelete.throws(error);

      await deleteChore(req, res);

      expect(findByIdAndDelete.calledOnceWith({ _id: id })).to.be.true;
      expect(res.status.calledOnceWith(500)).to.be.true;
      expect(res.json.calledOnceWith({ message: "Internal Server Error" })).to
        .be.true;
    });

    // Test 3
    it("should return 404 if chore not found", async () => {
      findOneStub.resolves({
        email: "noname@gmail.com",
        chores: [{ _id: { toString: sandbox.stub().returns(id + "x") } }],
        save: sandbox.stub().resolves(),
      });
      await deleteChore(req, res);

      expect(findByIdAndDelete.calledOnceWith({ _id: id })).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  describe("checkOffChore", () => {
    let req, res, findByIdStub, sandbox;

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
      findByIdStub = sinon.stub(Chore, "findById");
      sandbox = sinon.createSandbox();
      sandbox.stub(Chore.prototype, "save").returns({
        _id: "chore123",
        name: "Clean the kitchen",
        frequency: { quantity: 2, interval: "days" },
        location: "Kitchen",
        duration: 30,
        preference: "High",
        lastCheckedOff: [9484839483],
        nextOccurrence: 847578493,
      });
    });

    afterEach(() => {
      findByIdStub.restore();
      sinon.restore();
      sandbox.restore();
    });

    it("should return a 201 response with the chore if it is found", async () => {
      findByIdStub.returns({
        _id: "chore123",
        name: "Clean the kitchen",
        frequency: { quantity: 2, interval: "days" },
        location: "Kitchen",
        duration: 30,
        preference: "High",
        lastCheckedOff: [9484839483],
        save: sandbox.stub().resolves(),
      });

      await checkOffChore(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(
        res.json.calledOnceWith({ message: `Chore checked off successfully!` })
      ).to.be.true;
    });

    it("should return a 404 response with an error message if the chore is not found", async () => {
      const id = "someid";

      findByIdStub.resolves(null);

      await checkOffChore(req, res);

      console.log(res.json);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({
        message: `Chore with id ${id} was not found.`,
      });
    });

    it("should return a 500 response with an error message if there is an unexpected error", async () => {
      const error = new Error("Unexpected error");
      findByIdStub.rejects(error);

      await checkOffChore(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: "Internal Server Error" })).to.be
        .true;
    });
  });
});

//SCHEDULES CONTROLLER

describe("Testing Schedule controllers", function () {
  describe(" testing register function", function () {
    let req, res, findOneStub, findStub;

    beforeEach(() => {
      // Create a request
      req = {
        params: {
          timeframe: "2023-02-12",
        },
        user: { id: "user123" },
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };
      findOneStub = sinon.stub(User, "findOne");
      findStub = sinon.stub(Chore, "find");
    });

    afterEach(() => {
      // Restore all the stubbed functions
      sinon.restore();
    });

    it("should return a 201 response with the requested schedule", async () => {
      const chore = { name: "Clean the dishes", location: "kitchen" };
      findOneStub.returns({
        email: "test@test.com",
        password: "1234",
        chores: [],
      });

      findStub.returns([
        {
          _id: "dadd",
          name: "chore 1",
          frequency: {
            quantity: 2,
            interval: "days",
          },
          location: "Home",
          duration: 40,
          preference: "high",
          lastCheckedOff: [2343554, 23343545],
          nextOccurrence: 12324343,
        },
        {
          _id: "23434",
          name: "chore 2",
          frequency: {
            quantity: 2,
            interval: "weeks",
          },
          location: "Home",
          duration: 4,
          preference: "low",
          lastCheckedOff: [42343554, 2334324545],
          nextOccurrence: 123324343,
        },
        {
          _id: "2343424",
          name: "chore 3",
          frequency: {
            quantity: 2,
            interval: "months",
          },
          location: "School",
          duration: 4,
          preference: "medium",
          lastCheckedOff: [423454, 23324545],
          nextOccurrence: 124343,
        },
        {
          _id: "23434",
          name: "chore 2",
          frequency: {
            quantity: 2,
            interval: "years",
          },
          location: "Home",
          duration: 4,
          preference: "low",
          lastCheckedOff: [42343554, 2334324545],
          nextOccurrence: 123324343,
        },
      ]);

      await createSchedule(req, res);

      expect(res.status.calledWith(201)).to.be.true;
    });

    it("should return a 500 response with an error message if there is an unexpected error", async () => {
      const error = new Error("Unexpected error");
      findOneStub.rejects(error);
      findStub.rejects(error);

      await createSchedule(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: "Schedule could not be created." }))
        .to.be.true;
    });
  });
});

//SCHEDULES CONTROLLER

describe("Testing Schedule controllers", function () {
  describe(" testing register function", function () {
    let req, res, findOneStub, findStub;

    beforeEach(() => {
      // Create a request
      req = {
        params: {
          timeframe: "2023-02-12",
        },
        user: { id: "user123" },
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };
      findOneStub = sinon.stub(User, "findOne");
      findStub = sinon.stub(Chore, "find");
    });

    afterEach(() => {
      // Restore all the stubbed functions
      sinon.restore();
    });

    it("should return a 201 response with the requested schedule", async () => {
      const chore = { name: "Clean the dishes", location: "kitchen" };
      findOneStub.returns({
        email: "test@test.com",
        password: "1234",
        chores: [],
      });

      findStub.returns([
        {
          _id: "dadd",
          name: "chore 1",
          frequency: {
            quantity: 2,
            interval: "days",
          },
          location: "Home",
          duration: 40,
          preference: "high",
          lastCheckedOff: [2343554, 23343545],
          nextOccurrence: 12324343,
        },
        {
          _id: "23434",
          name: "chore 2",
          frequency: {
            quantity: 2,
            interval: "weeks",
          },
          location: "Home",
          duration: 4,
          preference: "low",
          lastCheckedOff: [42343554, 2334324545],
          nextOccurrence: 123324343,
        },
        {
          _id: "2343424",
          name: "chore 3",
          frequency: {
            quantity: 2,
            interval: "months",
          },
          location: "School",
          duration: 4,
          preference: "medium",
          lastCheckedOff: [423454, 23324545],
          nextOccurrence: 124343,
        },
        {
          _id: "23434",
          name: "chore 2",
          frequency: {
            quantity: 2,
            interval: "years",
          },
          location: "Home",
          duration: 4,
          preference: "low",
          lastCheckedOff: [42343554, 2334324545],
          nextOccurrence: 123324343,
        },
      ]);

      await createSchedule(req, res);

      expect(res.status.calledWith(201)).to.be.true;
    });

    it("should return a 500 response with an error message if there is an unexpected error", async () => {
      const error = new Error("Unexpected error");
      findOneStub.rejects(error);
      findStub.rejects(error);

      await createSchedule(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: "Schedule could not be created." }))
        .to.be.true;
    });
  });
});
