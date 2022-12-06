//var nodemailer = require('nodemailer');
import nodemailer from "nodemailer";
import { config } from "../config.cjs";

const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.useremail,
        pass: config.email.password
    }
});

let mailOptions = {
    from: config.email.from,
    to: config.email.to,
    subject: 'Sending Email using Node.js',
    text: 'Insert your text here!'
};

async function sendMail(message) {
    if (message === undefined) {
        message = mailOptions;
    }
    
    try {
        let info = await transporter.sendMail(message);
        console.log(`Email sent: ${info.response}`);
    }
    catch (error) {
        console.log(`sendMail threw error ${error}`);
    }
}

export {
    sendMail,
};
  