const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const dns = require('dns');

// CRITICAL FIX FOR RENDER: Force Node.js 18+ to use IPv4 instead of IPv6 for DNS resolution
dns.setDefaultResultOrder('ipv4first');

// Helper to get Resend instance
const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
};

const sendEmail = async (mailOptions) => {
    try {
        console.log('Attempting to send email via Gmail SMTP...');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: 587,
            secure: false, // MUST be false for port 587 (uses STARTTLS instead of Direct TLS)
            requireTLS: true, // Force TLS upgrade
            family: 4, // Keep IPv4 backup
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent via Gmail SMTP');
        return info;
    } catch (error) {
        console.error('❌ Gmail SMTP failed:', error.message);
        
        // Final attempt: If SMTP failed (common on Render), try Resend as a last resort
        const resend = getResend();
        if (resend) {
            console.log('Attempting emergency fallback to Resend API...');
            try {
                // IMPORTANT: Resend will reject the email if we try to send 'from' a @gmail.com address.
                // We MUST use 'onboarding@resend.dev' unless you have verified a custom domain on Resend.
                const response = await resend.emails.send({
                    from: 'Rizwan Store <onboarding@resend.dev>',
                    to: mailOptions.to,
                    subject: mailOptions.subject,
                    html: mailOptions.html,
                    text: mailOptions.text
                });
                
                if (response.error) {
                    console.error('❌ Resend API Error:', response.error);
                    throw new Error(response.error.message);
                }
                
                console.log('✅ Email sent via Resend Fallback, ID:', response.data?.id);
                return { messageId: response.data?.id };
            } catch (innerErr) {
                console.error('❌ Resend fallback also failed:', innerErr);
                throw innerErr;
            }
        } else {
            console.warn('⚠️ No RESEND_API_KEY provided in .env to use as fallback.');
            throw error; // Throw the original SMTP error if Resend is not configured
        }
    }
};

module.exports = { sendEmail };
