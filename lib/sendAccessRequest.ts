import nodemailer from "nodemailer"

export async function sendAccessRequestEmail(email: string, phone: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Vestate.lv" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verifikācijas kods - Privātie sludinājumi",
    html: `<p>Labdien!</p><p>Jūsu verifikācijas kods ir:</p><h2>${code}</h2><p>Kods derīgs 15 minūtes.</p>`,
  })

  await transporter.sendMail({
    from: `"Vestate.lv" <${process.env.SMTP_USER}>`,
    to: "mairisdigital@icloud.com",
    subject: "Jauns pieprasījums privātajiem sludinājumiem",
    html: `<p><strong>Klienta e-pasts:</strong> ${email}</p><p><strong>Tālrunis:</strong> ${phone}</p>`,
  })
}
