const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const dotenv = require("dotenv");
const User = require("../../models/User");
const Chore = require("../../models/Chore");
const { makeApp } = require("../../index");
const {
  startEmailService,
  getChoresForUser,
} = require("../../services/emailNotifier");
const { repeatInMs } = require("../../services/utils");
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const mongoose = require("mongoose");
const cron = require("node-cron");

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
    // Create a sandbox to stub functions
    sandbox = sinon.createSandbox();
    let pos = 0;
    // Stub the User and Chore models
    userFindStub = sandbox.stub(User, "find").resolves(testUsers);
    choreFindStub = sandbox.stub(Chore, "find").callsFake(() => {
      const userChores = testUsers[pos].chores;
      pos += 1;

      return Promise.resolve(userChores);
    });
  });

  afterEach(function () {
    // Restore the sandbox to its original state
    sandbox.restore();
  });
  after(function () {
    setTimeout(() => {
      process.exit();
    }, 2000);
  });
  it("should return an error if there is an exception thrown before sending the mail", async function () {
    // Testing error handling
    sandbox.restore();
    sandbox.stub(User, "find").throws(new Error("fake error"));

    // Stub the nodemailer createTransport method to return a fake transporter
    sandbox.stub(nodemailer, "createTransport").returns({
      sendMail: sandbox.stub().resolves(),
    });

    // Stub the Mailgen constructor to return a fake MailGenerator instance
    sandbox.stub(Mailgen.prototype, "generate").returns("<html></html>");

    // Call the function and wait for it to complete
    await startEmailService();

    // Assert that the User and Chore models were called with the correct arguments
    expect(User.find).to.have.been.calledOnce;
  });
  it("should return an error if there is an exception thrown while sending the mail", async function () {
    // Testing error handling
    // Stub the nodemailer createTransport method to return a fake transporter
    const transporterStub = sandbox
      .stub(nodemailer, "createTransport")
      .returns({
        sendMail: sandbox.stub().throws(new Error("Fake Error")),
      });

    // Stub the Mailgen constructor to return a fake MailGenerator instance
    sandbox.stub(Mailgen.prototype, "generate").returns("<html></html>");

    // Call the function and wait for it to complete
    await startEmailService();

    // Assert that the User and Chore models were called with the correct arguments
    expect(User.find).to.have.been.calledOnce;
    expect(transporterStub).to.have.been.calledOnce;
  });
  it("should send an email to each user with their chores for the day", async function () {
    // Stub the nodemailer createTransport method to return a fake transporter
    const transporterStub = sandbox
      .stub(nodemailer, "createTransport")
      .returns({
        sendMail: sandbox.stub().resolves(),
      });

    // Stub the Mailgen constructor to return a fake MailGenerator instance
    const MailGeneratorStub = sandbox
      .stub(Mailgen.prototype, "generate")
      .returns("<html></html>");

    // Call the function and wait for it to complete
    await startEmailService();

    // Assert that the User and Chore models were called with the correct arguments
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

    // Assert that the nodemailer createTransport method was called with the correct configuration
    expect(transporterStub).to.have.been.calledOnce;
    expect(transporterStub).to.have.been.calledWith({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Assert that the Mailgen constructor was called with the correct configuration
    expect(MailGeneratorStub).to.have.been.calledThrice;
  });

  it("should throw an error", async function () {
    const transporterStub = sandbox
      .stub(nodemailer, "createTransport")
      .returns({});
    // Stub the Mailgen constructor to return a fake MailGenerator instance
    const MailGeneratorStub = sandbox
      .stub(Mailgen.prototype, "generate")
      .throws(new Error("Unexpected error"));
    expect(MailGeneratorStub).to.have.not.been.called;
  });

  it("should return correct chores for today and overdue chores", async () => {
    const res0 = await getChoresForUser(testUsers[0]);
    expect(res0.todaysChores).to.deep.equal([]);
    expect(res0.overdueChores).to.deep.equal([]);
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

  describe("Cron Scheduler test", () => {
    it("should schedule email service to run at midnight", () => {
      // const cron = {
      //   schedule: sinon.stub(),
      // };
      const cronStub = sinon.stub(cron, "schedule").returns();
      const app = makeApp(mongoose, process.env.TEST_MONGO_URL); // connect to databse
      const scheduledFunction = cronStub.args[0][1];
      scheduledFunction();

      // Check that the cron.schedule method was called with the correct arguments
      sinon.assert.calledWith(cron.schedule, "0 0 * * *", sinon.match.func);
      cronStub.restore;
    });
  });
});
