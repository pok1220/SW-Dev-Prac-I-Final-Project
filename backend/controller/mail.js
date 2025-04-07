const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend'); 

const mailersend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY, 
});

const sendEmail = async (req, res) => {
    try {
        const { email, subject, message } = req.body;

        if (!email || !subject || !message) {
            return res.status(400).json({ success: false, message: "Missing email, subject, or message" });
        }
        const sentFrom = new Sender(process.env.MAILSENDER, process.env.MAILSERVER); // ต้องเป็นอีเมลที่ยืนยันแล้ว
        const recipient = [new Recipient(email, "User")];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipient)
            .setSubject(subject)
            .setText(message);
        const response = await mailersend.email.send(emailParams);
        res.status(200).json({ success: true, message: "Email sent successfully!" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Email sending failed!", error: error.message });
    }
};


const sendEmailFunction = async (req, res) => {
    try {
        const { email, subject, message } = req;
        if (!email || !subject || !message) {
            return {status:"error",message:"Missing email, subject, or message"}
        }
        const sentFrom = new Sender(process.env.MAILSENDER, process.env.MAILSERVER); // ต้องเป็นอีเมลที่ยืนยันแล้ว
        const recipient = [new Recipient(email, "User")];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipient)
            .setSubject(subject)
            .setText(message);
        const response = await mailersend.email.send(emailParams);
        console.log('Email sent successfully');
        return {status:"success", message: "Email sent successfully!"}

    } catch (error) {
        console.error('Failed to send email:', error.toString());
        return {status:"errror", message: "Email sending failed!"}
    }
};

module.exports = { sendEmail,sendEmailFunction };
