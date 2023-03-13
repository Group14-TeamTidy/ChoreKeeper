import chai from "chai";
import chaiHttp from "chai-http";
import sinonChai from "sinon-chai";
import User from "../../models/User.js";
import Chore from "../../models/Chore.js";
import makeApp from "../../index.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { response } from "express";

dotenv.config();
chai.use(chaiHttp);
chai.use(sinonChai);
chai.should();
const expect = chai.expect;
// let app;
const app = makeApp(mongoose, process.env.TEST_MONGO_URL); // connect to databse

//USERS CONTROLLER
describe("Integration Test", function () {
  before(async function () {
    app.listen(80, function () {
      console.log(`Server running on port 80`);
    });
  });
  after(function () {
    setTimeout(() => {
      process.exit();
    }, 2000);
    // app.close();
    // done();
  });
  describe("POST /api/signup", function () {
    /*
     * 1. The first test checks that the function creates a new user and returns a JWT token with a status code of 201.
     * 2. The third test checks that the function returns a 409 error if the user already exists.
     */
    after(async function () {
      await User.deleteOne({ email: "test@example.com" });
    });
    it("should register a new user", async () => {
      const body = { email: "test@example.com", password: "password123" };

      const res = await chai.request(app).post("/api/signup").send(body);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("token");
      expect(res.body.user).to.have.property("email", "test@example.com");
      expect(res.body.user).to.not.have.property("password");

      const user = await User.findOne({ email: "test@example.com" });
      expect(user.email).to.equal("test@example.com");
      expect(user.password).to.not.equal("testpassword");
    });
    it("should send user already exists response", async () => {
      const body = { email: "test@example.com", password: "password123" };

      const res = await chai.request(app).post("/api/signup").send(body);

      //   console.log(res.body.user);
      expect(res.status).to.equal(409);
      expect(res.body.message).to.equal("test@example.com is already in use");
    });
  });

  describe("POST /api/login", function () {
    /*
     * 1. The first test checks that the login function can appropirately login a user and token is generated
     * 2. The second test checks that a user cannot login in if they don't have an account.
     * 3. The third test checks that a user cannot login with an invalid password
     */
    before(async function () {
      // Encrypt password
      const password = "1234567";
      const email = "user1@iamarealuser.com";
      const salt = await bcrypt.genSalt();
      const pwdHash = await bcrypt.hash(password, salt);
      const newUser = new User({ email, password: pwdHash });
      await newUser.save();
    });

    after(async function () {
      await User.deleteOne({ email: "user1@iamarealuser.com" });
    });

    it("should login a user if the user exists", async () => {
      const body = { email: "user1@iamarealuser.com", password: "1234567" };
      const res = await chai.request(app).post("/api/login").send(body);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("token");
      expect(res.body.user).to.have.property("email", "user1@iamarealuser.com");
      expect(res.body.user).to.not.have.property("password");
    });

    it("should send a user does not exist response", async () => {
      const body = {
        email: "fakeuser@iamnotarealuser.com",
        password: "1234567",
      };
      const res = await chai.request(app).post("/api/login").send(body);

      expect(res.status).to.equal(400);
      expect(res.body).to.not.have.property("token");
      expect(res.body.message).to.equal(
        `User with email fakeuser@iamnotarealuser.com not found`
      );
    });

    it("should send invalid password if the password is incorrect", async () => {
      const body = {
        email: "user1@iamarealuser.com",
        password: "wrongpassword",
      };
      const res = await chai.request(app).post("/api/login").send(body);

      expect(res.status).to.equal(400);
      expect(res.body).to.not.have.property("token");
      expect(res.body.message).to.equal("Invalid password");
    });
  });
  describe("GET /api/user/email", function () {
    /*
     * 1. The first test checks if a valid user is returned
     * 2. The second test checks that an invalid user is not returned
     * 3. The third test checks that the unauthorized requests are rejected
     */
    let token;
    before(async function () {
      // Encrypt password
      const password = "1234567";
      const email = "user1@iamarealuser.com";
      const salt = await bcrypt.genSalt();
      const pwdHash = await bcrypt.hash(password, salt);
      const newUser = new User({ email, password: pwdHash });
      token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      await newUser.save();
    });

    after(async function () {
      await User.deleteOne({ email: "user1@iamarealuser.com" });
    });

    it("should return a valid user", async () => {
      const res = await chai
        .request(app)
        .get("/api/user/email")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.user.email).to.equal("user1@iamarealuser.com");
    });
    it("should return user does not exist", async () => {
      const fakeToken = jwt.sign(
        { id: "63e43b73f26f0a96062d489e" },
        process.env.JWT_SECRET
      );

      const res = await chai
        .request(app)
        .get("/api/user/email")
        .set("Authorization", `Bearer ${fakeToken}`);

      expect(res.status).to.equal(401);
      expect(res.body).to.not.have.property("user");
      expect(res.body.message).to.equal("This User does not exist");
    });

    it("should reject unauthorized requests", async () => {
      const res = await chai.request(app).get("/api/user/email");
      const res2 = await chai
        .request(app)
        .get("/api/user/email")
        .set("Authorization", `Bearer ${"12424.25155.15616581"}`);

      expect(res.status).to.equal(403);
      expect(res2.status).to.equal(403);
    });
  });

  describe("GET /api/chores/", function () {
    let token;
    before(async function () {
      // Encrypt password
      const password = "1234567";
      const email = "user1@iamarealuser.com";
      const salt = await bcrypt.genSalt();
      const pwdHash = await bcrypt.hash(password, salt);
      const newUser = new User({ email, password: pwdHash });
      token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const newChore = new Chore({
        name: "Sweep the floor",
        frequency: { quantity: 2, interval: "weeks" },
        location: "Kitchen",
        duration: 3000,
        preference: "high",
      });
      const savedChore = await newChore.save();
      newUser.chores.push(savedChore._id);
      await newUser.save();
    });

    after(async function () {
      await User.deleteOne({ email: "user1@iamarealuser.com" });
      await Chore.deleteOne({ name: "Sweep the floor" });
    });

    it("should return a list of the users chores", async () => {
      const res = await chai
        .request(app)
        .get("/api/chores/")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.length(1);
      expect(res.body[0].name).to.equal("Sweep the floor");
      expect(res.body[0].location).to.equal("Kitchen");
      expect(res.body[0].duration).to.equal(3000);
      expect(res.body[0].preference).to.equal("high");
      expect(res.body[0].frequency.quantity).to.equal(2);
      expect(res.body[0].frequency.interval).to.equal("weeks");
    });
  });

  describe("GET /api/chores/:id", function () {
    let token;
    let choreId;
    before(async function () {
      // Encrypt password
      const password = "1234567";
      const email = "user1@iamarealuser.com";
      const salt = await bcrypt.genSalt();
      const pwdHash = await bcrypt.hash(password, salt);
      const newUser = new User({ email, password: pwdHash });
      token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const newChore = new Chore({
        name: "Sweep the floor",
        frequency: { quantity: 2, interval: "weeks" },
        location: "Kitchen",
        duration: 3000,
        preference: "high",
      });
      const savedChore = await newChore.save();
      choreId = savedChore._id;
      newUser.chores.push(savedChore._id);
      await newUser.save();
    });

    after(async function () {
      await User.deleteOne({ email: "user1@iamarealuser.com" });
      await Chore.deleteOne({ name: "Sweep the floor" });
    });

    it("should return a single chore", async () => {
      const res = await chai
        .request(app)
        .get(`/api/chores/${choreId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body.name).to.equal("Sweep the floor");
      expect(res.body.location).to.equal("Kitchen");
      expect(res.body.duration).to.equal(3000);
      expect(res.body.preference).to.equal("high");
      expect(res.body.frequency.quantity).to.equal(2);
      expect(res.body.frequency.interval).to.equal("weeks");
    });
    it("should return no chore found", async () => {
      const res = await chai
        .request(app)
        .get(`/api/chores/63e43b73f26f0a96062d489e`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal("Chore not found");
    });
  });

  describe("PUT /api/chores/:id", function () {
    let token;
    let choreId;
    before(async function () {
      // Encrypt password
      const password = "1234567";
      const email = "user1@iamarealuser.com";
      const salt = await bcrypt.genSalt();
      const pwdHash = await bcrypt.hash(password, salt);
      const newUser = new User({ email, password: pwdHash });
      token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const newChore = new Chore({
        name: "Sweep the floor",
        frequency: { quantity: 2, interval: "weeks" },
        location: "Kitchen",
        duration: 3000,
        preference: "high",
      });
      const savedChore = await newChore.save();
      choreId = savedChore._id;
      newUser.chores.push(savedChore._id);
      await newUser.save();
    });

    after(async function () {
      await User.deleteOne({ email: "user1@iamarealuser.com" });
      await Chore.deleteOne({ name: "Sweep the floor" });
    });

    it("should an updated chore", async () => {
      const body = {
        name: "Sweep the floor",
        frequency: { quantity: 2, interval: "weeks" },
        location: "Room",
        duration: 3000,
        preference: "high",
      };
      const res = await chai
        .request(app)
        .put(`/api/chores/${choreId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(body);
      expect(res.status).to.equal(201);
      expect(res.body.location).to.equal("Room");
    });
    it("should return no chore found", async () => {
      const body = {
        name: "Sweep the floor",
        frequency: { quantity: 2, interval: "weeks" },
        location: "Room",
        duration: 3000,
        preference: "high",
      };
      const res = await chai
        .request(app)
        .get(`/api/chores/63e43b73f26f0a96062d489e`)
        .set("Authorization", `Bearer ${token}`)
        .send(body);
      expect(res.status).to.equal(404);
    });
  });

  describe("DELETE /api/chores/:id", function () {
    let token;
    let choreId;
    before(async function () {
      // Encrypt password
      const password = "1234567";
      const email = "user1@iamarealuser.com";
      const salt = await bcrypt.genSalt();
      const pwdHash = await bcrypt.hash(password, salt);
      const newUser = new User({ email, password: pwdHash });
      token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const newChore = new Chore({
        name: "Sweep the floor",
        frequency: { quantity: 2, interval: "weeks" },
        location: "Kitchen",
        duration: 3000,
        preference: "high",
      });
      const savedChore = await newChore.save();
      choreId = savedChore._id;
      newUser.chores.push(savedChore._id);
      await newUser.save();
    });

    after(async function () {
      await User.deleteOne({ email: "user1@iamarealuser.com" });
    });

    it("should delete an existing chore", async () => {
      const res = await chai
        .request(app)
        .delete(`/api/chores/${choreId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message");

      const user = await User.findOne({ email: "user1@iamarealuser.com" });
      expect(user.chores).to.have.length(0);
      const chore = await Chore.findOne({ name: "Sweep the floor" });
      expect(chore).to.be.equal(null);
    });
    it("should return an error for chores that don't exist", async () => {
      const res = await chai
        .request(app)
        .delete(`/api/chores/63e43b73f26f0a96062d489e`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(500);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.equal("Internal Server Error");
    });
  });

  describe("POST /api/chores/", function () {
    let token;
    let choreId;
    before(async function () {
      // Encrypt password
      const password = "1234567";
      const email = "user1@iamarealuser.com";
      const salt = await bcrypt.genSalt();
      const pwdHash = await bcrypt.hash(password, salt);
      const newUser = new User({ email, password: pwdHash });
      token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const newChore = new Chore({
        name: "Sweep the floor",
        frequency: { quantity: 2, interval: "weeks" },
        location: "Kitchen",
        duration: 3000,
        preference: "high",
      });
      const savedChore = await newChore.save();
      choreId = savedChore._id;
      newUser.chores.push(savedChore._id);
      await newUser.save();
    });

    after(async function () {
      await User.deleteOne({ email: "user1@iamarealuser.com" });
      await Chore.deleteOne({ name: "Sweep the floor" });
    });

    it("should create a new chore", async () => {
      const body = {
        name: "Clean the windows",
        frequency: { quantity: 2, interval: "weeks" },
        location: "Room",
        duration: 3000,
        preference: "high",
      };
      const res = await chai
        .request(app)
        .post(`/api/chores/`)
        .set("Authorization", `Bearer ${token}`)
        .send(body);
      expect(res.status).to.equal(201);
      expect(res.body.Chore.name).to.equal("Clean the windows");
      expect(res.body.Chore.location).to.equal("Room");
      expect(res.body.Chore.duration).to.equal(3000);
      expect(res.body.Chore.preference).to.equal("high");
      expect(res.body.Chore.frequency.quantity).to.equal(2);
      expect(res.body.Chore.frequency.interval).to.equal("weeks");
      await Chore.deleteOne({ name: "Clean the windows" });
    });
    it("should return chore already exists", async () => {
      const body = {
        name: "Sweep the floor",
        frequency: { quantity: 2, interval: "weeks" },
        location: "Kitchen",
        duration: 3000,
        preference: "high",
      };
      const res = await chai
        .request(app)
        .post(`/api/chores/`)
        .set("Authorization", `Bearer ${token}`)
        .send(body);
      expect(res.status).to.equal(409);
    });
  });
});
