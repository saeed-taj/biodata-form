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
    // PERSONAL INFORMATION
    firstPage.drawText(`Form Date: ${data.form_date || ""}`, { x: 50, y: height - 100, size: 12, font });
    firstPage.drawText(`Applicant CNIC: ${data.cnic || ""}`, { x: 300, y: height - 100, size: 12, font });
    firstPage.drawText(`Name: ${data.name || ""}`, { x: 50, y: height - 130, size: 12, font });
    firstPage.drawText(`Jamati Title: ${data.jamati_title || ""}`, { x: 50, y: height - 150, size: 12, font });
    firstPage.drawText(`Gender: ${data.gender || ""}`, { x: 50, y: height - 170, size: 12, font });
    firstPage.drawText(`Date of Birth: ${data.dob || ""}`, { x: 300, y: height - 170, size: 12, font });
    firstPage.drawText(`Marital Status: ${data.marital_status || ""}`, { x: 50, y: height - 190, size: 12, font });
    firstPage.drawText(`Residential Address: ${data.address || ""}`, { x: 50, y: height - 210, size: 12, font });
    firstPage.drawText(`City/Village: ${data.city || ""}`, { x: 50, y: height - 230, size: 12, font });
    firstPage.drawText(`Mobile: ${data.mobile || ""}`, { x: 50, y: height - 250, size: 12, font });
    firstPage.drawText(`Email: ${data.email || ""}`, { x: 50, y: height - 270, size: 12, font });
    firstPage.drawText(`Area of Origin: ${data.area_origin || ""}`, { x: 50, y: height - 290, size: 12, font });
    firstPage.drawText(`Jamatkhana: ${data.jamatkhana || ""}`, { x: 50, y: height - 310, size: 12, font });
    firstPage.drawText(`Local Council: ${data.local_council || ""}`, { x: 50, y: height - 330, size: 12, font });
    firstPage.drawText(`Regional Council: ${data.regional_council || ""}`, { x: 50, y: height - 350, size: 12, font });
    firstPage.drawText(`Relocate Plan: ${data.relocate || ""}`, { x: 50, y: height - 370, size: 12, font });

    // EDUCATION
    firstPage.drawText(`Secular Education: ${data.education_level || ""}`, { x: 50, y: height - 400, size: 12, font });
    firstPage.drawText(`Year From: ${data.edu_from1 || ""}`, { x: 50, y: height - 420, size: 12, font });
    firstPage.drawText(`Year To: ${data.edu_to1 || ""}`, { x: 150, y: height - 420, size: 12, font });
    firstPage.drawText(`Institution: ${data.edu_institution1 || ""}`, { x: 250, y: height - 420, size: 12, font });
    firstPage.drawText(`Major: ${data.edu_major1 || ""}`, { x: 50, y: height - 440, size: 12, font });
    firstPage.drawText(`Degree: ${data.edu_degree1 || ""}`, { x: 250, y: height - 440, size: 12, font });
    firstPage.drawText(`Country: ${data.edu_country1 || ""}`, { x: 400, y: height - 440, size: 12, font });

    // OCCUPATION
    firstPage.drawText(`Occupation: ${data.occupation || ""}`, { x: 50, y: height - 470, size: 12, font });
    firstPage.drawText(`Year From: ${data.job_from1 || ""}`, { x: 50, y: height - 490, size: 12, font });
    firstPage.drawText(`Year To: ${data.job_to1 || ""}`, { x: 150, y: height - 490, size: 12, font });
    firstPage.drawText(`Organization: ${data.job_org1 || ""}`, { x: 250, y: height - 490, size: 12, font });
    firstPage.drawText(`Designation: ${data.job_designation1 || ""}`, { x: 400, y: height - 490, size: 12, font });

    // VOLUNTARY SERVICE
    firstPage.drawText(`Voluntary Service: ${data.vol_service || ""}`, { x: 50, y: height - 520, size: 12, font });
    firstPage.drawText(`Year From: ${data.vol_from1 || ""}`, { x: 50, y: height - 540, size: 12, font });
    firstPage.drawText(`Year To: ${data.vol_to1 || ""}`, { x: 150, y: height - 540, size: 12, font });
    firstPage.drawText(`Institution: ${data.vol_institution1 || ""}`, { x: 250, y: height - 540, size: 12, font });
    firstPage.drawText(`Position: ${data.vol_position1 || ""}`, { x: 400, y: height - 540, size: 12, font });

    // Signature & Date
    firstPage.drawText(`Signature: ${data.signature || ""}`, { x: 50, y: height - 580, size: 12, font });
    firstPage.drawText(`Date: ${data.final_date || ""}`, { x: 300, y: height - 580, size: 12, font });
    
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
      to: "gulshan@akcpk.org, zulfikar.roomi@akcpk.org",
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

