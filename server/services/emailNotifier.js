import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import dotenv from "dotenv";
import User from "../models/User.js";
import Chore from "../models/Chore.js";
import { repeatInMs } from "./utils.js";
dotenv.config();

/*
 ** This function gets the current day
 ** and returns a time in Unix timestamp formatted to 12am
 */
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toUTCFormat(today);
};

/*
 ** This function formats a date to 12am at the start of that day
 ** @params date, date in UTC format
 */
const toUTCFormat = (date) => {
  const millisecondsPerDay = 86400000;
  const unixEpochMilliseconds = 0;
  return (
    Math.floor((date * 1000) / millisecondsPerDay) * millisecondsPerDay +
    unixEpochMilliseconds
  );
};

/*
 ** This function gets the chores for that need to be emailed to a user
 ** @params user,  a user object
 ** It returns an object that contains the chores the user needs to do today, and the overdue chores the user has
 */
export const getChoresForUser = async (user) => {
  const today = getToday();

  const chores = await Chore.find({
    _id: { $in: user.chores },
    nextOccurrence: { $exists: true },
  });

  // get the chores for today
  const todaysChores = chores
    .filter((chore) => {
      const timeframeIndays = repeatInMs(
        chore.frequency.quantity,
        chore.frequency.interval
      );
      const nextOccurrence = toUTCFormat(chore.nextOccurrence);

      return (today - nextOccurrence) % timeframeIndays === 0;
    })
    .map((chore) => {
      return {
        Chore: chore.name,
        Location: chore.location,
        "Duration(minutes)": chore.duration / 60,
      };
    });

  // get all over due chores
  // over due chores would have a timestamp older than today's date
  const overdueChores = chores
    .filter((chore) => {
      const nextOccurrence = toUTCFormat(chore.nextOccurrence);

      return nextOccurrence < today;
    })
    .map((chore) => {
      return {
        Chore: chore.name,
        Location: chore.location,
        "Duration(minutes)": chore.duration / 60,
        From: new Date(chore.nextOccurrence).toLocaleDateString(),
      };
    });

  return { todaysChores, overdueChores };
};

/*
 ** This function sends emails to all the users that are subscribed to notifications
 */
export const startEmailService = async () => {
  const config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  };
  const transporter = nodemailer.createTransport(config);
  const MailGenerator = new Mailgen({
    theme: "cerberus",
    product: {
      name: "Chorekeeper",
      link: process.env.FRONTEND,
    },
  });

  try {
    const users = await User.find({});

    for (const user of users) {
      //skip users that don't want notifications
      if (!user.receiveNotifs) {
        continue;
      }
      const { todaysChores, overdueChores } = await getChoresForUser(user);
      const intro =
        todaysChores.length === 0 && overdueChores.length === 0
          ? "You have no chores to do today!"
          : "Here are your chores for today!";
      const response = {
        body: {
          greeting: "Hello",
          name: "",
          intro,
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
        .then(console.log(`email sent to ${message.to}`))
        .catch((error) => {
          console.error(error);
        });
    }
  } catch (error) {
    console.log(error);
  }
};
