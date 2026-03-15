const nodemailer = require('nodemailer');

let cachedTransporter = null;

function getTransporter() {
    if (cachedTransporter) return cachedTransporter;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !Number.isFinite(port) || !user || !pass) {
        throw new Error('SMTP config missing: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
    }

    const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

    cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });

    return cachedTransporter;
}

async function sendMail({ to, subject, text, html }) {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    if (!to) throw new Error('Missing recipient: to');
    if (!subject) throw new Error('Missing subject');

    const transporter = getTransporter();

    return transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
    });
}

module.exports = {
    sendMail,
};
