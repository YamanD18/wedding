/**
 * BACKEND RSVP — Google Apps Script
 * File ini di-paste ke Google Apps Script (bukan dijalankan di server sendiri).
 * Panduan lengkap ada di backend/README.md
 *
 * Fungsi:
 * - doPost(e)  -> menerima RSVP baru dari form undangan, menyimpannya sebagai baris baru
 *                 di Google Spreadsheet.
 * - doGet(e)   -> mengembalikan seluruh data RSVP (nama, kehadiran, ucapan) dalam JSON,
 *                 dipakai untuk menampilkan daftar ucapan & jumlah hadir/tidak hadir.
 */

const SHEET_NAME = "RSVP"; // nama sheet/tab tempat data disimpan

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Waktu", "Nama", "Kehadiran", "Ucapan"]);
  }
  return sheet;
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const nama = String(body.nama || "").trim();
    const kehadiran = String(body.kehadiran || "").trim();
    const ucapan = String(body.ucapan || "").trim();

    if (!nama || !ucapan) {
      return jsonResponse({ ok: false, error: "Data tidak lengkap" });
    }

    const sheet = getSheet();
    sheet.appendRow([new Date(), nama, kehadiran, ucapan]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doGet(e) {
  const action = e.parameter.action || "list";
  if (action === "list") {
    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    rows.shift(); // buang header
    const data = rows
      .filter((r) => r[1]) // baris dengan nama terisi
      .map((r) => ({
        waktu: r[0],
        nama: r[1],
        kehadiran: r[2],
        ucapan: r[3],
      }));
    return jsonResponse({ ok: true, data });
  }
  return jsonResponse({ ok: false, error: "Aksi tidak dikenal" });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
