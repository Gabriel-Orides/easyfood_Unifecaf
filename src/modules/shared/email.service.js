const nodemailer = require("nodemailer");

// Provedor escolhido: SMTP via Nodemailer (ex.: Gmail com senha de app).
// Para trocar de provedor (MailerSend, Resend, Brevo...), basta alterar
// a parte que conversa com a API dentro de sendEmail(). O restante da
// EasyFood depende apenas da assinatura de sendEmail().

let transporter;

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Serviço de e-mail não configurado: preencha EMAIL_USER e EMAIL_PASS no .env"
    );
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  return transporter;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml({ header, body, footer }) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${header}</h2>
      <div>${body}</div>
      <hr />
      <p style="color: #888; font-size: 12px;">
        ${footer}
      </p>
    </div>
  `;
}

function htmlToText(html) {
  return String(html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

async function sendEmail({ to, toName, subject, header, body, footer }) {
  if (!to) {
    throw new Error("Destinatário do e-mail não informado");
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const fromName = process.env.EMAIL_FROM_NAME || "EasyFood";

  await getTransporter().sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: toName ? `"${toName}" <${to}>` : to,
    replyTo: fromAddress,
    subject,
    html: buildHtml({ header, body, footer }),
    text: `${htmlToText(header)}\n\n${htmlToText(body)}\n\n${htmlToText(footer)}`
  });

  console.log(`[EMAIL] Enviado para ${to} - "${subject}"`);
}

module.exports = {
  sendEmail,
  escapeHtml
};
