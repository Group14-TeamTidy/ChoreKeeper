import Mocha from "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
import sinonChai from "sinon-chai";
import Chore from "../models/Chore.js";
import User from "../models/User.js";

chai.use(chaiHttp);
chai.use(sinonChai);
chai.should();
const expect = chai.expect;

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

describe("Testing the Chores model", () => {
  it("should have a property name, frequency,location, location,duration,preference", () => {
    const chore = new Chore();
    expect(chore).to.have.property("name");
    expect(chore).to.have.property("frequency");
    expect(chore.frequency).to.have.property("quantity");
    expect(chore.frequency).to.have.property("interval");
    expect(chore).to.have.property("location");
    expect(chore).to.have.property("duration");
    expect(chore).to.have.property("preference");
  });

  it("create a chore", () => {
    const chore = new Chore({
      name: "Clean my room",
      frequency: {
        quantity: 2,
        interval: "days",
      },
      location: "room",
      duration: 1800,
      preference: "high",
    });
    expect(chore.name).to.equal("Clean my room");
    expect(chore.frequency.quantity).to.equal(2);
    expect(chore.frequency.interval).to.equal("days");
    expect(chore.location).to.equal("room");
    expect(chore.duration).to.equal(1800);
    expect(chore.preference).to.equal("high");
  });
});
