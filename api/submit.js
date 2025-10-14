import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts } from "pdf-lib";

// Minimal PDF template in memory
const createTemplatePDF = async () => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText("Biodata Form", { x: 50, y: 800, size: 20, font });
  page.drawText("Fill the details below:", { x: 50, y: 780, size: 12, font });

  return pdfDoc;
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const data = req.body;

  try {
    const pdfDoc = await createTemplatePDF();
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Fill PDF fields
    firstPage.drawText(`Form Date: ${data.form_date || ""}`, { x: 50, y: height - 120, size: 12, font });
    firstPage.drawText(`CNIC: ${data.cnic || ""}`, { x: 300, y: height - 120, size: 12, font });
    firstPage.drawText(`Name: ${data.name || ""}`, { x: 50, y: height - 150, size: 12, font });
    firstPage.drawText(`Email: ${data.email || ""}`, { x: 50, y: height - 170, size: 12, font });
    firstPage.drawText(`Mobile: ${data.mobile || ""}`, { x: 50, y: height - 190, size: 12, font });
    firstPage.drawText(`Address: ${data.address || ""}`, { x: 50, y: height - 210, size: 12, font });
    firstPage.drawText(`Occupation: ${data.occupation || ""}`, { x: 50, y: height - 230, size: 12, font });
    firstPage.drawText(`Signature: ${data.signature || ""}`, { x: 50, y: height - 250, size: 12, font });

    const pdfBytes = await pdfDoc.save();

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "gulshan@akcpk.org, zulfikar.roomi@akcpk.org, vishalbaig6@gmail.com",
      subject: "New Filled Biodata Form",
      text: `New biodata form has been submitted by ${data.name}. CNIC: ${data.cnic}`,
      attachments: [
        {
          filename: "biodata_form.pdf",
          content: pdfBytes,
        },
      ],
    });

    return res.status(200).send("Form submitted and emailed successfully!");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error sending PDF email");
  }
}

