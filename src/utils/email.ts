import nodemailer from "nodemailer";
import mg from "nodemailer-mailgun-transport";

const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  const auth = {
    auth: {
      api_key: process.env.EMAIL_API_KEY!,
      domain: process.env.EMAIL_DOMAIN!,
    },
  };

  const nodemailerMailgun = nodemailer.createTransport(mg(auth));

  const mailOptions = {
    from: `Abyss Admin <mailgun@${process.env.EMAIL_DOMAIN!}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  return await nodemailerMailgun.sendMail(mailOptions);
};

export default sendEmail;
