"use client";
import React from "react";

export default function ExportReportButton() {
  const handleExport = async () => {
    try {
      const res = await fetch("/api/v1/reports/export-pdf", {
        method: "GET",
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Hotel_Accounting_Report.pdf";
      a.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Error exporting report.");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      Export Accounting Report as PDF
    </button>
  );
}
