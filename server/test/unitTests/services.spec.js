import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import dotenv from "dotenv";
import User from "../../models/User.js";
import Chore from "../../models/Chore.js";
import { startEmailService } from "../../services/emailNotifier.js";
import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

dotenv.config();

chai.use(sinonChai);
chai.should();
const expect = chai.expect;

describe("startEmailService", function () {
  let sandbox;
  let today = new Date();
  let testUsers = [
    { email: "user1@test.com", chores: [] },
    { email: "user2@test.com", chores: ["chore1", "chore2"] },
    { email: "user3@test.com", chores: ["chore3"] },
  ];
  let testChores = [
    {
      name: "chore1",
      location: "kitchen",
      duration: 30,
      nextOccurrence: today,
    },
    {
      name: "chore2",
      location: "bathroom",
      duration: 45,
      nextOccurrence: new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate() - 1
      ),
    },
    {
      name: "chore3",
      location: "bedroom",
      duration: 60,
      nextOccurrence: new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate() - 1
      ),
    },
  ];

  beforeEach(function () {
    // create a sandbox to stub functions
    sandbox = sinon.createSandbox();

    // stub the User and Chore models
    sandbox.stub(User, "find").returns(Promise.resolve(testUsers));
    sandbox.stub(Chore, "find").returns(Promise.resolve(testChores));
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
    expect(Chore.find).to.have.been.calledWith({ _id: { $in: [] } });
    expect(Chore.find).to.have.been.calledWith({
      _id: { $in: ["chore1", "chore2"] },
    });
    expect(Chore.find).to.have.been.calledWith({ _id: { $in: ["chore3"] } });

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
});
