import Mocha from "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import makeApp from "../index.js";
import User from "../models/User.js";
chai.use(chaiHttp);
chai.use(sinonChai);
chai.should();
const expect = chai.expect;

//CONTROLLER TESTS
describe("Testing User controllers", () => {});
describe("Testing Chores controllers", () => {});
// MODEL TESTS
describe("Testing the User model", () => {
  it("should have a property `email`and `password`", () => {
    const user = new User();
    expect(user).to.have.property("email");
    expect(user).to.have.property("password");
  });
  it("`email` property should be 'testemail@chores.com'", () => {
    const user = new User({ email: "testemail@chores.com" });
    expect(user.email).to.equal("testemail@chores.com");
  });
  it("`password` property should be 'testpassword'", () => {
    const user = new User({ password: "testpassword" });
    expect(user.password).to.equal("testpassword");
  });
});

describe("Testing the Chores model", () => {});
//ROUTE TESTS

// API TESTS
