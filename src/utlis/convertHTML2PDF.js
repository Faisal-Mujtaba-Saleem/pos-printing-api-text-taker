import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export default async function convertHTML2PDF(html, { savePDF = false, generateHtmlBoilerPlate = true }) {
  // 1️⃣ Prepare output directory (e.g. src/temp)
  const outputDir = path.join(process.cwd(), "src", "temp");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 2️⃣ Generate unique filename
  const fileName = `booking_receipt_${Date.now()}.pdf`;
  const pdfFilePath = path.join(outputDir, fileName);

  // 3️⃣ Wrap JSX/HTML string into a complete HTML document
  let htmlDoc = `${html}`;
  if (generateHtmlBoilerPlate)
    htmlDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Booking Receipt</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: 'Inter', sans-serif; }
        </style>
      </head>
      <body class="bg-gray-100 flex items-center justify-center min-h-screen">
        ${html}
      </body>
    </html>
  `;


  // 4️⃣ Launch Puppeteer
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // adjust path
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlDoc, { waitUntil: "networkidle0" });

    // 5️⃣ Generate PDF directly to file (no need for fs.writeFileSync)
    if (savePDF) {
      await page.pdf({
        path: pdfFilePath,
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          bottom: "20mm",
          left: "15mm",
          right: "15mm",
        },
      });
    }
    else {
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          bottom: "20mm",
          left: "15mm",
          right: "15mm",
        },
      });

      return pdfBuffer;
    }
  } finally {
    await browser.close();
  }

  // 6️⃣ Return the absolute path to the saved PDF
  return pdfFilePath;
}
