/**
 * File conversion module.
 * Supported conversions:
 *   xlsx/xls  → csv, json
 *   csv       → xlsx, json
 *   json      → csv, xml
 *   xml       → json
 *   pdf       → txt, json (AI-powered)
 *   txt       → (pass-through)
 */

const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const xml2js = require('xml2js');
const { convertPdfToJsonAI, convertTextWithAI, convertWithAI } = require('./ai-converter');

// Detect format from file extension
function detectFormat(filename) {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  const aliases = { xls: 'xlsx' };
  return aliases[ext] || ext;
}

// Convert a file and write the result to outputPath.
// Returns { outputPath } on success or throws on failure.
async function convertFile({ inputPath, inputFormat, targetFormat, outputPath }) {
  const fmt = `${inputFormat}_to_${targetFormat}`;
  let workbook = null; // Para limpiar recursos XLSX
  let pdfBuffer = null; // Para limpiar recursos PDF

  try {
    switch (fmt) {
    // ---------- XLSX / XLS → CSV ----------
    case 'xlsx_to_csv': {
      workbook = XLSX.readFile(inputPath);
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const csv = XLSX.utils.sheet_to_csv(ws);
      fs.writeFileSync(outputPath, csv, 'utf8');
      workbook = null; // Liberar referencia
      break;
    }

    // ---------- XLSX / XLS → JSON ----------
    case 'xlsx_to_json': {
      workbook = XLSX.readFile(inputPath);
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), 'utf8');
      workbook = null; // Liberar referencia
      break;
    }

    // ---------- CSV → XLSX ----------
    case 'csv_to_xlsx': {
      const raw = fs.readFileSync(inputPath, 'utf8');
      workbook = XLSX.read(raw, { type: 'string' });
      XLSX.writeFile(workbook, outputPath);
      workbook = null; // Liberar referencia
      break;
    }

    // ---------- CSV → JSON ----------
    case 'csv_to_json': {
      workbook = XLSX.readFile(inputPath);
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), 'utf8');
      workbook = null; // Liberar referencia
      break;
    }

    // ---------- JSON → CSV ----------
    case 'json_to_csv': {
      const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      const rows = Array.isArray(data) ? data : [data];
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const csv = XLSX.utils.sheet_to_csv(ws);
      fs.writeFileSync(outputPath, csv, 'utf8');
      break;
    }

    // ---------- JSON → XLSX ----------
    case 'json_to_xlsx': {
      const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      const rows = Array.isArray(data) ? data : [data];
      const ws = XLSX.utils.json_to_sheet(rows);
      workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, ws, 'Sheet1');
      XLSX.writeFile(workbook, outputPath);
      workbook = null; // Liberar referencia
      break;
    }

    // ---------- JSON → XML ----------
    case 'json_to_xml': {
      const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      const builder = new xml2js.Builder({ rootName: 'root' });
      const xml = builder.buildObject({ item: Array.isArray(data) ? data : [data] });
      fs.writeFileSync(outputPath, xml, 'utf8');
      break;
    }

    // ---------- XML → JSON ----------
    case 'xml_to_json': {
      const raw = fs.readFileSync(inputPath, 'utf8');
      const parsed = await xml2js.parseStringPromise(raw, { explicitArray: false });
      fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2), 'utf8');
      break;
    }

    // ---------- PDF → TXT ----------
    case 'pdf_to_txt': {
      const pdfParse = require('pdf-parse');
      pdfBuffer = fs.readFileSync(inputPath);
      const parsed = await pdfParse(pdfBuffer);
      fs.writeFileSync(outputPath, parsed.text || '', 'utf8');
      pdfBuffer = null; // Liberar buffer
      break;
    }

    // ---------- PDF → JSON (AI-powered) ----------
    case 'pdf_to_json': {
      await convertPdfToJsonAI(inputPath, outputPath);
      break;
    }

    // ---------- TXT pass-through ----------
    case 'txt_to_txt': {
      fs.copyFileSync(inputPath, outputPath);
      break;
    }

    default:
      // Intentar conversión con IA para formatos no soportados tradicionalmente
      console.log(`[AI] Trying conversion ${inputFormat} → ${targetFormat} with DeepSeek`);
      return await convertWithAI(inputPath, inputFormat, targetFormat, outputPath);
    }

    return { outputPath };
  
  } catch (error) {
    console.error(`Conversion error (${inputFormat} → ${targetFormat}):`, error.message);
    throw error;
  } finally {
    // Forzar limpieza de memoria
    workbook = null;
    pdfBuffer = null;
    if (global.gc) {
      try { global.gc(); } catch (e) { /* ignore */ }
    }
  }
}

module.exports = { detectFormat, convertFile };
