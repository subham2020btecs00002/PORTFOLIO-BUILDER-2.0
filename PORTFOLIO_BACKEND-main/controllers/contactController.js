const nodemailer = require('nodemailer');

exports.sendContactEmail = async (req, res) => {
  const { name, email, phone, reason } = req.body;

  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  // Setup email data
  const mailOptions = {
    from: email,
    to: process.env.RECEIVER_EMAIL, // Your email address to receive messages
    subject: `${name} wants to contact you`,
    text: `
      Here are the details:
      
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Reason: ${reason}
    `,
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email');
  }
};
