/**
 * AI-powered converter using DeepSeek (free Chinese AI)
 * Handles complex document conversions that require understanding
 */

const fs = require('fs');

// DeepSeek API (FREE)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'demo'; // Muy tolerante, funciona sin key real
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

async function callDeepSeek(prompt, text) {
  try {
    // Si no hay API key, usa fallback simple
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'demo') {
      console.warn('[AI] No DEEPSEEK_API_KEY set, using fallback extraction');
      return fallbackExtraction(text, prompt);
    }

    const payload = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Eres un experto en extracción de datos de documentos. Responde solo con JSON válido, sin explicaciones.' },
        { role: 'user', content: `${prompt}\n\nTexto del documento:\n${text}` }
      ],
      max_tokens: 2048,
      temperature: 0.1
    };

    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(content);
    } catch {
      // Si la IA no devuelve JSON válido, usar fallback
      return fallbackExtraction(text, prompt);
    }
  } catch (error) {
    console.warn('[AI] DeepSeek failed, using fallback:', error.message);
    return fallbackExtraction(text, prompt);
  }
}

// Fallback cuando no hay API key o falla la IA
function fallbackExtraction(text, prompt) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  if (prompt.includes('tabla') || prompt.includes('table')) {
    // Intento básico de detectar tablas
    const tableData = lines
      .filter(line => line.includes('\t') || /\s{3,}/.test(line))
      .slice(0, 20)
      .map(line => line.split(/\s{2,}|\t/).filter(Boolean));
    
    return { 
      type: 'table',
      headers: tableData[0] || [],
      rows: tableData.slice(1) || [],
      fallback: true
    };
  }
  
  return {
    text: text.substring(0, 5000), // Primeros 5k chars
    lines: lines.slice(0, 50),
    fallback: true
  };
}

// Convierte PDF a JSON estructurado usando IA
async function convertPdfToJsonAI(inputPath, outputPath) {
  try {
    const pdfParse = require('pdf-parse');
    const raw = fs.readFileSync(inputPath);
    const parsed = await pdfParse(raw);
    const text = parsed.text || '';

    const prompt = `
Analiza este documento PDF y extrae información estructurada en JSON.

Si contiene una tabla, devuelve:
{
  "type": "table",
  "headers": ["columna1", "columna2", ...],
  "rows": [["valor1", "valor2"], ["valor3", "valor4"], ...]
}

Si es texto general, devuelve:
{
  "type": "document", 
  "title": "título del documento",
  "sections": [{"heading": "...", "content": "..."}],
  "entities": ["nombres importantes", "fechas", "números"]
}

Si contiene datos de contacto/personas, devuelve:
{
  "type": "contacts",
  "contacts": [{"name": "...", "email": "...", "phone": "..."}]
}
`;

    const result = await callDeepSeek(prompt, text);
    
    // Añadir metadata siempre
    const output = {
      meta: {
        pages: parsed.numpages,
        extractedBy: result.fallback ? 'fallback' : 'deepseek',
        timestamp: new Date().toISOString()
      },
      ...result
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    return { outputPath };
  } catch (error) {
    console.error('PDF parsing error:', error.message);
    // Fallback básico si falla todo
    const output = {
      meta: {
        error: error.message,
        timestamp: new Date().toISOString()
      },
      type: 'error',
      message: 'No se pudo procesar el PDF'
    };
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    return { outputPath };
  }
}

// Convierte cualquier texto a formato específico usando IA  
async function convertTextWithAI(text, fromFormat, toFormat, outputPath) {
  let aiResult = null;
  let output = null;
  
  try {
    const prompts = {
      'to_csv': `Analiza este contenido de ${fromFormat} y conviértelo a formato CSV.
- Identifica columnas lógicas y sepáralas con comas
- Incluye headers en la primera línea
- Escapa las comas dentro de campos con comillas dobles
- Una fila por línea
- Responde SOLO con el contenido CSV, sin explicaciones`,

      'to_json': `Analiza este contenido de ${fromFormat} y extrae datos estructurados:
- Si es una tabla: {"headers": [...], "rows": [[...]]}  
- Si es texto: {"sections": [{"title": "...", "content": "..."}]}
- Si son datos: {"items": [{"field": "value", ...}]}
- Responde SOLO con JSON válido, sin explicaciones`,

      'to_xml': `Convierte este contenido de ${fromFormat} a XML bien formado:
- Usa tags descriptivos apropiados
- Incluye declaración XML al inicio
- Estructura jerárquica lógica
- Responde SOLO con el XML, sin explicaciones`,

      'to_xlsx': `Analiza este contenido de ${fromFormat} y organiza en formato tabular:
- Identifica headers y filas de datos
- Estructura: una fila por registro
- Responde SOLO con datos tabulares separados por tabs`,

      'to_txt': `Convierte este contenido de ${fromFormat} a texto plano legible:
- Mantén la información importante
- Formato limpio y organizado
- Responde SOLO con el texto, sin explicaciones`,

      'to_pdf': 'El formato PDF requiere librerías especiales. Convertimos a texto estructurado que puedes imprimir como PDF.'
    };

    const prompt = prompts[`to_${toFormat}`] || 
      `Convierte este contenido de formato ${fromFormat} a formato ${toFormat}. 
       Analiza la estructura del contenido y mantén la información esencial. 
       Responde solo con el contenido convertido, sin explicaciones.`;
    
    aiResult = await callDeepSeek(prompt, text);
    
    // Manejo específico por formato de salida
    if (toFormat === 'json') {
      output = typeof aiResult === 'object' ? aiResult : { content: aiResult, source: fromFormat };
      fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    } else if (toFormat === 'csv') {
      const csvContent = typeof aiResult === 'string' ? aiResult : 
        (aiResult.rows ? [aiResult.headers, ...aiResult.rows].map(row => row.join(',')).join('\n') : 
         JSON.stringify(aiResult, null, 2));
      fs.writeFileSync(outputPath, csvContent, 'utf8');
    } else {
      const textOutput = typeof aiResult === 'string' ? aiResult : JSON.stringify(aiResult, null, 2);
      fs.writeFileSync(outputPath, textOutput, 'utf8');
    }
    
    return { outputPath };
    
  } catch (error) {
    console.error(`AI text conversion failed (${fromFormat} → ${toFormat}):`, error.message);
    throw error;
  } finally {
    // Liberar referencias explícitamente
    aiResult = null;
    output = null;
    text = null; // También liberar el texto de entrada
  }
}

// Función universal para convertir cualquier formato a cualquier formato usando IA
async function convertWithAI(inputPath, inputFormat, targetFormat, outputPath) {
  let text = '';
  let pdfBuffer = null;
  let workbook = null;
  let jsonData = null;
  
  try {
    // Extraer texto según el formato de entrada
    switch (inputFormat.toLowerCase()) {
      case 'pdf':
        const pdfParse = require('pdf-parse');
        pdfBuffer = fs.readFileSync(inputPath);
        const parsed = await pdfParse(pdfBuffer);
        text = parsed.text || '';
        pdfBuffer = null; // Liberar inmediatamente
        break;

      case 'xlsx':
      case 'xls':
        const XLSX = require('xlsx');
        workbook = XLSX.readFile(inputPath);
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        text = XLSX.utils.sheet_to_csv(ws);
        workbook = null; // Liberar inmediatamente
        break;

      case 'txt':
      case 'csv':
        text = fs.readFileSync(inputPath, 'utf8');
        break;

      case 'json':
        jsonData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
        text = JSON.stringify(jsonData, null, 2);
        jsonData = null; // Liberar inmediatamente
        break;

      case 'xml':
        text = fs.readFileSync(inputPath, 'utf8');
        break;

      default:
        text = fs.readFileSync(inputPath, 'utf8');
    }

    // Usar IA para convertir
    const result = await convertTextWithAI(text, inputFormat, targetFormat, outputPath);
    text = null; // Liberar texto grande
    return result;
    
  } catch (error) {
    console.error(`AI conversion failed (${inputFormat} → ${targetFormat}):`, error.message);
    throw new Error(`No se pudo convertir ${inputFormat} a ${targetFormat} con IA: ${error.message}`);
  } finally {
    // Limpieza forzada de todas las variables
    text = null;
    pdfBuffer = null;
    workbook = null;
    jsonData = null;
    
    // Forzar garbage collection si está disponible
    if (global.gc) {
      try { global.gc(); } catch (e) { /* ignore */ }
    }
  }
}

module.exports = {
  convertPdfToJsonAI,
  convertTextWithAI,
  convertWithAI,
  callDeepSeek
};