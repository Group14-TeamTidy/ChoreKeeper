import chai from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import makeApp from "../index.js";
import { sayHello } from "../controller/hello.js";
chai.use(chaiHttp);
chai.use(sinonChai);
chai.should();
const expect = chai.expect;

// Example
describe("test say hello", () => {
  it("The sayHello function should return hello world", async () => {
    const app = makeApp(); // connect to databse
    const response = await chai.request(app).get("/api"); // tesing api
    expect(response.text).to.equal("Hello World!");
    response.should.have.status(200);
  });
});

//CONTROLLER TESTS
describe("Testing User controllers", () => {});
describe("Testing Chores controllers", () => {});
// MODEL TESTS
describe("Testing the User model", () => {});
describe("Testing the Chores model", () => {});
//ROUTE TESTS

// API TESTS
