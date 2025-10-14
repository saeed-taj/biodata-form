import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import { PDFDocument, StandardFonts } from "pdf-lib";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/submit", async (req, res) => {
  const data = req.body;

  try {
    // Load your template biodata PDF
    const formBytes = fs.readFileSync("template.pdf");
    const pdfDoc = await PDFDocument.load(formBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // --- Draw Text on the PDF (you can adjust X,Y positions later) ---
    firstPage.drawText(`Form Date: ${data.form_date || ""}`, { x: 50, y: height - 120, size: 12, font });
    firstPage.drawText(`CNIC: ${data.cnic || ""}`, { x: 300, y: height - 120, size: 12, font });

    firstPage.drawText(`Name: ${data.name || ""}`, { x: 50, y: height - 150, size: 12, font });
    firstPage.drawText(`Email: ${data.email || ""}`, { x: 50, y: height - 170, size: 12, font });
    firstPage.drawText(`Mobile: ${data.mobile || ""}`, { x: 50, y: height - 190, size: 12, font });
    firstPage.drawText(`Address: ${data.address || ""}`, { x: 50, y: height - 210, size: 12, font });
    firstPage.drawText(`Occupation: ${data.occupation || ""}`, { x: 50, y: height - 230, size: 12, font });
    firstPage.drawText(`Signature: ${data.signature || ""}`, { x: 50, y: height - 250, size: 12, font });

    // --- Save filled PDF ---
    const filledPdfBytes = await pdfDoc.save();
    const outputPath = "filled_biodata.pdf";
    fs.writeFileSync(outputPath, filledPdfBytes);

    // --- Send Email ---
   const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,  // Gmail username from Render
    pass: process.env.GMAIL_PASS,  // Gmail app password from Render
  },
});

    const mailOptions = {
      from: "saeedtaj00@gmail.com",
      to: "gulshan@akcpk.org, zulfikar.roomi@akcpk.org, vishalbaig6@gmail.com",
      subject: "New Filled Biodata Form",
      text: `New biodata form has been submitted by ${data.name}. CNIC: ${data.cnic}`,
      attachments: [
        {
          filename: "biodata_form.pdf",
          path: outputPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send("Form submitted and emailed successfully!");

    // --- Clean up ---
    fs.unlinkSync(outputPath);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending PDF email");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
