/**
 * RSVP → Google Sheet untuk Kad Walimatulurus Alieya & Farhan
 * --------------------------------------------------------------
 * Tampal kod ini dalam Google Sheet: Extensions → Apps Script.
 * Kemudian jalankan setup() sekali, dan Deploy → New deployment → Web app.
 * Lihat PANDUAN-RSVP.md untuk langkah penuh.
 *
 * Satu baris = satu tetamu. Jika tetamu hantar semula dengan nombor
 * telefon yang sama, baris lama dikemas kini (tiada duplikat).
 */

const SHEET = 'RSVP';
const SUMMARY = 'Ringkasan';
const MAX_PAX = 3;
const HEADERS = ['Masa', 'Nama', 'No. Telefon', 'Kehadiran', 'Bilangan', 'Ucapan', 'Pautan jemputan', 'Kali dikemas kini'];

/** Jalankan sekali: sediakan tab RSVP + Ringkasan. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET, 0);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#7a1530').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  sh.getRange('C:C').setNumberFormat('@');
  sh.setColumnWidths(1, 1, 140); sh.setColumnWidth(2, 220); sh.setColumnWidth(3, 140);
  sh.setColumnWidth(4, 110); sh.setColumnWidth(5, 80); sh.setColumnWidth(6, 380); sh.setColumnWidth(7, 180);
  sh.getRange('F:F').setWrap(true);

  const rules = [
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Hadir').setBackground('#e6f2e6').setFontColor('#1e5a2a').setRanges([sh.getRange('D2:D')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Tidak hadir').setBackground('#f8e1e5').setFontColor('#7a1530').setRanges([sh.getRange('D2:D')]).build()
  ];
  sh.setConditionalFormatRules(rules);

  const sm = ss.getSheetByName(SUMMARY) || ss.insertSheet(SUMMARY, 1);
  sm.clear();
  sm.getRange('A1:B1').setValues([['Ringkasan RSVP', '']]).setFontWeight('bold').setFontSize(14);
  sm.getRange('A3:B7').setValues([
    ['Jumlah jawapan', '=COUNTA(RSVP!B2:B)'],
    ['Keluarga hadir', '=COUNTIF(RSVP!D2:D,"Hadir")'],
    ['Jumlah tetamu hadir (orang)', '=SUMIF(RSVP!D2:D,"Hadir",RSVP!E2:E)'],
    ['Tidak hadir', '=COUNTIF(RSVP!D2:D,"Tidak hadir")'],
    ['Dikemas kini', '=NOW()']
  ]);
  sm.getRange('A3:A7').setFontWeight('bold');
  sm.getRange('B5').setFontSize(18).setFontColor('#7a1530').setFontWeight('bold');
  sm.getRange('B7').setNumberFormat('dd/MM/yyyy HH:mm');
  sm.setColumnWidth(1, 240); sm.setColumnWidth(2, 160);
}

/** Borang RSVP menghantar ke sini. */
function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return json({ ok: true }); // perangkap bot

  const nama = clean(p.nama, 80);
  const tel = String(p.telefon || '').trim().slice(0, 20);
  const digits = tel.replace(/\D/g, '');
  const hadir = p.kehadiran === 'hadir';
  let pax = parseInt(p.bilangan, 10);
  pax = hadir ? Math.min(MAX_PAX, Math.max(1, isNaN(pax) ? 1 : pax)) : 0;
  const ucapan = clean(p.ucapan, 300);
  const pautan = clean(p.jemputan, 60);

  if (nama.length < 2) return json({ ok: false, error: 'Nama diperlukan' });
  if (digits.length < 9 || digits.length > 13) return json({ ok: false, error: 'No. telefon tidak sah' });

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet();
    const key = normPhone(digits);
    const last = sh.getLastRow();
    let rowIdx = -1, edits = 0;
    if (last > 1) {
      const phones = sh.getRange(2, 3, last - 1, 1).getValues();
      for (let i = 0; i < phones.length; i++) {
        if (normPhone(String(phones[i][0]).replace(/\D/g, '')) === key) { rowIdx = i + 2; break; }
      }
      if (rowIdx > 0) edits = Number(sh.getRange(rowIdx, 8).getValue()) || 0;
    }
    const row = [new Date(), nama, "'" + tel, hadir ? 'Hadir' : 'Tidak hadir', pax, ucapan, pautan, rowIdx > 0 ? edits + 1 : 0];
    if (rowIdx > 0) sh.getRange(rowIdx, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
    return json({ ok: true, updated: rowIdx > 0 });
  } finally {
    lock.releaseLock();
  }
}

/** Dinding ucapan: hanya nama + ucapan + status (TIADA nombor telefon). */
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action !== 'wishes') return json({ ok: true });
  const sh = sheet();
  const last = sh.getLastRow();
  if (last < 2) return json({ ok: true, wishes: [] });
  const rows = sh.getRange(2, 1, last - 1, 6).getValues();
  const wishes = rows
    .filter(r => String(r[5]).trim())
    .map(r => ({ t: r[0] instanceof Date ? r[0].toISOString() : '', n: unq(r[1]), a: r[3] === 'Hadir' ? 'hadir' : 'tidak', w: unq(r[5]) }))
    .sort((a, b) => (a.t < b.t ? 1 : -1))
    .slice(0, 150);
  return json({ ok: true, wishes });
}

/* ---------- helpers ---------- */
function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) { setup(); sh = ss.getSheetByName(SHEET); }
  return sh;
}
// Elak "formula injection": teks yang bermula dengan = + - @ disimpan sebagai teks biasa
function clean(v, max) {
  let s = String(v || '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function unq(v) { return String(v).replace(/^'/, ''); }
// 0123456789, 60123456789 dan +60 12-345 6789 dikira nombor yang sama
function normPhone(d) { return d.replace(/^60/, '0').replace(/^0+/, ''); }
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
