'use server';

import fs from "fs";
import path from "path";
import convertHTML2PDF from "@/utlis/convertHTML2PDF";
import { getDefaultPrinter, print } from "pdf-to-printer";

export async function printBookingReceipt(prevState, formData) {
  try {
    // 🧩 Step 1: Get HTML content from form data
    const bookingReceiptHTML = formData.get("booking_receipt");
    if (!bookingReceiptHTML) {
      throw new Error("No HTML content found for booking_receipt.");
    }

    // 🧩 Step 2: Convert HTML → PDF (file saved automatically by convertHTML2PDF)
    const exePath = path.resolve("node_modules/pdf-to-printer/dist/SumatraPDF-3.4.6-32.exe");
    const pdfFilePath = await convertHTML2PDF(bookingReceiptHTML, { savePDF: true });

    // 🧩 Step 3: Print the PDF
    await print(pdfFilePath, {
      printer: process.env.PRINTER_NAME || (await getDefaultPrinter()).name,
      sumatraPdfPath: exePath,
      scale: "fit",          // Fit to page
      paperSize: "A4",
      orientation: "portrait",
      printDialog: true
    });

    // 🧩 Step 4: Clean up temporary file
    if (fs.existsSync(pdfFilePath)) {
      console.log("Deleting temporary PDF file:", pdfFilePath);
      fs.unlinkSync(pdfFilePath);
    }

    console.log("Successfully printed.");

    // 🧩 Step 5: Return success message
    return {
      success: true,
      message: "Booking receipt printed successfully.",
    };

  } catch (error) {
    console.error("Error printing receipt:", error.message);

    return {
      success: false,
      message: error.message || "Failed to print booking receipt.",
    };
  }
}
