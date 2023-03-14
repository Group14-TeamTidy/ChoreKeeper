import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import dotenv from "dotenv";
import User from "../models/User.js";
import Chore from "../models/Chore.js";

dotenv.config();

export async function startEmailService() {
  const today = new Date(); // get today's date
  let config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  };
  let transporter = nodemailer.createTransport(config);
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Chorekeeper",
      link: "", //add frontend link
    },
  });

  //get user
  let users = await User.find().exec();

  // for loop to loop through all the users
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    //collect user chores
    let chores = await Chore.find({ _id: { $in: user.chores } });
    //select todays chores
    let todaysChores = chores.filter((chore) => {
      const nextOccurrence = new Date(chore.nextOccurrence);
      return (
        nextOccurrence.getFullYear() === today.getFullYear() &&
        nextOccurrence.getMonth() === today.getMonth() &&
        nextOccurrence.getDate() === today.getDate()
      );
    });
    todaysChores.map((chore) => {
      return {
        Chore: chore.name,
        Location: chore.location,
        Duration: chore.duration,
        Preference: chore.preference,
      };
    });

    //select overdue chores
    let overdueChores = chores.filter((chore) => {
      const nextOccurrence = new Date(chore.nextOccurrence);
      return (
        nextOccurrence.getFullYear() <= today.getFullYear() &&
        nextOccurrence.getMonth() <= today.getMonth() &&
        nextOccurrence.getDate() <= today.getDate()
      );
    });
    overdueChores.map((chore) => {
      return {
        Chore: chore.name,
        Location: chore.location,
        Duration: chore.duration,
        Preference: chore.preference,
        Date: new Date(chore.nextOccurrence).toLocaleDateString("en-US"),
      };
    });

    //build body
    let response = {
      body: {
        name: "ChoreKeeper",
        intro: "Here are your chores for today!",
        table: [
          {
            title: "Today's Chores",
            data: [todaysChores],
          },
          {
            title: "Overdue Chores",
            data: [overdueChores],
          },
        ],

        action: {
          instructions: "To get started, please click here:",
          button: {
            color: "#22BC66", // Optional action button color
            text: "Get started",
            link: "", // frontend link
          },
        },
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };
    //build email
    let mail = MailGenerator.generate(response);
    let message = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your Daily Chores",
      html: mail,
    };

    //send mail
    transporter
      .sendMail(message)
      .then(console.log(`email sent to${message.to}`))
      .catch((error) => {
        console.error(error);
      });
  }
}

async function test() {
  // testing account
  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  let message = {
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  };

  transporter
    .sendMail(message)
    .then(console.log(`email sent to${message.to}`))
    .catch((error) => {
      console.log(error);
    });
}

startMailService();
