import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import dotenv from "dotenv";
import User from "../models/User.js";
import Chore from "../models/Chore.js";

dotenv.config();

export const startEmailService = async () => {
  let today = new Date(); // get today's date

  // set the UTS to 12am
  const millisecondsPerDay = 86400000;
  const unixEpochMilliseconds = Date.parse("1970-01-01T00:00:00Z");
  today =
    Math.floor((today * 1000) / millisecondsPerDay) * millisecondsPerDay +
    unixEpochMilliseconds;

  const toDaysSelector = { days: 1, weeks: 7, month: 30, year: 365 };

  const dateSelector = {
    today: today,
    nextOccurrence: undefined,
  };

  let config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  let transporter = nodemailer.createTransport(config);
  let MailGenerator = new Mailgen({
    theme: "cerberus",
    product: {
      name: "Chorekeeper",
      link: process.env.FRONTEND, //add frontend link
    },
  });

  try {
    //get user
    let users = await User.find({});

    // for loop to loop through all the users
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      //collect user chores
      let chores = await Chore.find({
        _id: { $in: user.chores },
        nextOccurrence: { $exists: true },
      });

      //select todays chores
      let tempChores = chores.filter((chore) => {
        let timeframeIndays =
          toDaysSelector[chore.frequency.interval] * chore.frequency.quantity;

        //approximate next occurrence to nextOccurrence at 12am
        dateSelector.nextOccurrence =
          Math.floor((chore.nextOccurrence * 1000) / millisecondsPerDay) *
            millisecondsPerDay +
          unixEpochMilliseconds;

        return (
          (dateSelector.today - dateSelector.nextOccurrence) %
            timeframeIndays ===
          0
        );
      });
      let todaysChores = tempChores.map((chore) => {
        return {
          Chore: chore.name,
          Location: chore.location,
          "Duration(minutes)": chore.duration / 60,
        };
      });

      //select overdue chores
      let overChores = chores.filter((chore) => {
        //approximate next occurrence to nextOccurrence at 12am
        dateSelector.nextOccurrence =
          Math.floor((chore.nextOccurrence * 1000) / millisecondsPerDay) *
            millisecondsPerDay +
          unixEpochMilliseconds;
        return dateSelector.nextOccurrence < dateSelector.today;
      });
      let overdueChores = overChores.map((chore) => {
        return {
          Chore: chore.name,
          Location: chore.location,
          "Duration(minutes)": chore.duration / 60,
          // Preference: chore.preference,
          From: new Date(chore.nextOccurrence).toLocaleDateString("en-US"),
        };
      });

      //build body
      let response = {
        body: {
          greeting: "Hello",
          name: "",
          intro:
            todaysChores.length === 0 && overdueChores.length === 0
              ? "You have no chores to do today!"
              : "Here are your chores for today!",
          table: [
            {
              title: todaysChores.length !== 0 ? "Today's Chores" : undefined,
              data: [...todaysChores],
            },
            {
              title: overdueChores.length !== 0 ? "Overdue Chores" : undefined,
              data: [...overdueChores],
            },
          ],
          action: {
            instructions:
              todaysChores.length !== 0
                ? "To get started, please click here:"
                : "Click here to create new chores",
            button: {
              color: "#313131", // Optional action button color
              text: "Open ChoreKeeper",
              link: process.env.FRONTEND, // frontend link
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
        subject: "Your Chores For Today",
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
  } catch (error) {
    console.log(error);
  }
};
