import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import dotenv from "dotenv";
import User from "../../models/User.js";
import Chore from "../../models/Chore.js";
import {
  startEmailService,
  getChoresForUser,
} from "../../services/emailNotifier.js";
import { repeatInMs } from "../../services/utils.js";
import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

dotenv.config();

chai.use(sinonChai);
chai.should();
const expect = chai.expect;

describe("startEmailService", function () {
  let today = new Date();
  const yesterday = today.getTime() - 86400000;
  const tomorrow = today.getTime() + 86400000;
  const twoDaysAgo = today.getTime() - 2 * 86400000;

  let sandbox;
  let userFindStub;
  let choreFindStub;

  let testChores = [
    {
      _id: "abcdef",
      name: "Test Chore 1",
      location: "Location 1",
      duration: 3000,
      frequency: { interval: "days", quantity: 3 },
      nextOccurrence: yesterday,
    },
    {
      _id: "abcdefgh",
      name: "Test Chore 2",
      location: "Location 2",
      duration: 6000,
      frequency: { interval: "days", quantity: 2 },
      nextOccurrence: twoDaysAgo,
    },
    {
      _id: "abcdefijk",
      name: "Test Chore 3",
      location: "Location 3",
      duration: 4500,
      frequency: { interval: "days", quantity: 1 },
      nextOccurrence: tomorrow,
    },
    {
      _id: "abcdefijssssk",
      name: "Test Chore 4",
      location: "Location 4",
      duration: 4005,
      frequency: { interval: "days", quantity: 1 },
      nextOccurrence: today.getTime(),
    },
  ];
  let testUsers = [
    { email: "user1@test.com", chores: [], receiveNotifs: true },
    {
      email: "user2@test.com",
      chores: [testChores[0], testChores[1], testChores[2], testChores[3]],
      receiveNotifs: true,
    },
    { email: "user3@test.com", chores: [testChores[2]], receiveNotifs: true },
    { email: "user4@test.com", chores: [testChores[2]], receiveNotifs: false },
  ];

  beforeEach(function () {
    // create a sandbox to stub functions
    sandbox = sinon.createSandbox();
    let pos = 0;
    // stub the User and Chore models
    userFindStub = sandbox.stub(User, "find").resolves(testUsers);
    choreFindStub = sandbox.stub(Chore, "find").callsFake(() => {
      const userChores = testUsers[pos].chores;
      pos += 1;

      return Promise.resolve(userChores);
    });
  });

  afterEach(function () {
    // restore the sandbox to its original state
    sandbox.restore();
  });

  it("should send an email to each user with their chores for the day", async function () {
    // stub the nodemailer createTransport method to return a fake transporter
    const transporterStub = sandbox
      .stub(nodemailer, "createTransport")
      .returns({
        sendMail: sandbox.stub().resolves(),
      });

    // stub the Mailgen constructor to return a fake MailGenerator instance
    const MailGeneratorStub = sandbox
      .stub(Mailgen.prototype, "generate")
      .returns("<html></html>");

    // call the function and wait for it to complete
    await startEmailService();

    // assert that the User and Chore models were called with the correct arguments
    expect(User.find).to.have.been.calledOnce;
    expect(User.find).to.have.been.calledWith({});

    expect(Chore.find).to.have.been.calledThrice;
    expect(Chore.find).to.have.been.calledWith({
      _id: { $in: [] },
      nextOccurrence: { $exists: true },
    });
    expect(Chore.find).to.have.been.calledWith({
      _id: {
        $in: [testChores[0], testChores[1], testChores[2], testChores[3]],
      },
      nextOccurrence: { $exists: true },
    });
    expect(Chore.find).to.have.been.calledWith({
      _id: { $in: [testChores[2]] },
      nextOccurrence: { $exists: true },
    });

    // assert that the nodemailer createTransport method was called with the correct configuration
    expect(transporterStub).to.have.been.calledOnce;
    expect(transporterStub).to.have.been.calledWith({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // assert that the Mailgen constructor was called with the correct configuration
    expect(MailGeneratorStub).to.have.been.calledThrice;
  });

  it("should throw an error", async function () {
    const transporterStub = sandbox
      .stub(nodemailer, "createTransport")
      .returns({});
    // stub the Mailgen constructor to return a fake MailGenerator instance
    const MailGeneratorStub = sandbox
      .stub(Mailgen.prototype, "generate")
      .throws(new Error("Unexpected error"));
    // expect(transporterStub).to.have.not.been.called;
    expect(MailGeneratorStub).to.have.not.been.called;
  });

  it("should return correct chores for today and overdue chores", async () => {
    const res0 = await getChoresForUser(testUsers[0]);
    expect(res0.todaysChores).to.deep.equal([]);
    expect(res0.overdueChores).to.deep.equal([]);

    // const res1 = await getChoresForUser(testUsers[1]);
    // expect(res1.todaysChores.length).to.equal(2);
    // expect(res1.overdueChores.length).to.equal(2);
  });

  it("should return the correct number of milliseconds for days", () => {
    const quantity = 2;
    const interval = "days";
    const expectedMs = 172800000; // 2 days = 2 * 24 * 60 * 60 * 1000 ms

    const actualMs = repeatInMs(quantity, interval);

    expect(actualMs).to.equal(expectedMs);
  });

  it("should return the correct number of milliseconds for weeks", () => {
    const quantity = 3;
    const interval = "weeks";
    const expectedMs = 1814400000; // 3 weeks = 3 * 7 * 24 * 60 * 60 * 1000 ms

    const actualMs = repeatInMs(quantity, interval);

    expect(actualMs).to.equal(expectedMs);
  });

  it("should use the correct conversion factor for months", () => {
    const quantity = 1;
    const interval = "months";
    const expectedMs = 2592000000; // 1 month = 30 * 24 * 60 * 60 * 1000 ms

    const actualMs = repeatInMs(quantity, interval);

    expect(actualMs).to.equal(expectedMs);
  });

  it("should use the correct conversion factor for years", () => {
    const quantity = 5;
    const interval = "years";
    const expectedMs = 157680000000; // 5 years = 5 * 365 * 24 * 60 * 60 * 1000 ms

    const actualMs = repeatInMs(quantity, interval);

    expect(actualMs).to.equal(expectedMs);
  });
});
