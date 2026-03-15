const { sendMail } = require('../utils/mailer');

// POST /api/admin/test-email
const sendTestEmail = async (req, res) => {
    const to = req.body?.to || req.restaurant?.email;

    if (!to) {
        return res.status(400).json({ message: 'Destinataire manquant (to)' });
    }

    try {
        const restaurantName = req.restaurant?.name || 'Restaurant';

        await sendMail({
            to,
            subject: `Test email - ${restaurantName}`,
            text: `Bonjour, ceci est un email de test envoyé depuis votre application (${restaurantName}).`,
            html: `<div style="font-family:Arial,sans-serif">
                    <h3 style="margin:0 0 8px">Email de test</h3>
                    <p style="margin:0 0 6px">Bonjour, ceci est un email de test envoyé depuis votre application (<strong>${restaurantName}</strong>).</p>
                    <p style="margin:0;color:#666">Si vous recevez ce message, la configuration SMTP est correcte.</p>
                   </div>`,
        });

        return res.json({ success: true, to });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('sendTestEmail error:', err);
        return res.status(500).json({
            message: "Échec de l'envoi de l'email",
            details: process.env.NODE_ENV === 'production' ? undefined : (err.message || String(err)),
        });
    }
};

module.exports = {
    sendTestEmail,
};
