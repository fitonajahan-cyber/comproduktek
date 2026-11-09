/**
 * Format string tanggal atau objek Date ke dd-mm-yyyy
 * @param {string|Date} dateVal 
 * @returns {string}
 */
export function formatDDMMYYYY(dateVal) {
  if (!dateVal) return "-";
  const d = typeof dateVal === "string" && !dateVal.includes("T")
    ? new Date(`${dateVal}T00:00:00`)
    : new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Export array of objects to Excel file (.xlsx)
 * @param {Array<Object>} data - The dataset to export
 * @param {string} fileName - Base filename without extension
 * @param {string} sheetName - Name of worksheet
 */
export async function exportToExcel(data, fileName = "export-data", sheetName = "Data") {
  if (!data || !data.length) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-fit column widths
  const keys = Object.keys(data[0] || {});
  const colWidths = keys.map((key) => {
    let maxLen = key.length;
    data.forEach((row) => {
      const val = row[key] ? String(row[key]) : "";
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(Math.max(maxLen + 3, 10), 50) };
  });
  worksheet["!cols"] = colWidths;

  const dateStr = formatDDMMYYYY(new Date());
  XLSX.writeFile(workbook, `${fileName}_${dateStr}.xlsx`);
}

/**
 * Export array of objects to CSV file (.csv)
 */
export async function exportToCSV(data, fileName = "export-data") {
  if (!data || !data.length) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  const dateStr = formatDDMMYYYY(new Date());
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

