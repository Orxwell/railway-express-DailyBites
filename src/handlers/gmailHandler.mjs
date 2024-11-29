import nodemailer from 'nodemailer';

const gmail_user = process.env.GMAIL_USER;
const gmail_key  = process.env.GMAIL_KEY ;

if (!gmail_user) {
  console.error(
    '\n  ~Error:' +
    '\n    La variable de entorno GMAIL_USER es obligatoria.'
  );
  process.exit(1);
}
  
if (!gmail_key) {
  console.error(
    '\n  ~Error:' +
    '\n    La variable de entorno GMAIL_KEY es obligatoria.'
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmail_user,
    pass: gmail_key
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default transporter;
