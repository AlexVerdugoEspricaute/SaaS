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
}

// Convierte cualquier texto a formato específico usando IA  
async function convertTextWithAI(text, fromFormat, toFormat, outputPath) {
  const prompts = {
    'to_csv': 'Convierte este contenido a formato CSV. Identifica columnas lógicas y sepáralas con comas. Incluye headers.',
    'to_json': 'Extrae datos estructurados de este contenido y devuelve JSON válido con arrays y objetos apropiados.',
    'to_xml': 'Convierte este contenido a XML bien formado con tags descriptivos.',
    'to_markdown': 'Convierte este contenido a Markdown con headers, listas y formato apropiado.'
  };

  const prompt = prompts[`to_${toFormat}`] || `Convierte este contenido de ${fromFormat} a ${toFormat}.`;
  
  const result = await callDeepSeek(prompt, text);
  
  if (toFormat === 'json') {
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  } else {
    const textOutput = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    fs.writeFileSync(outputPath, textOutput, 'utf8');
  }
  
  return { outputPath };
}

module.exports = {
  convertPdfToJsonAI,
  convertTextWithAI,
  callDeepSeek
};