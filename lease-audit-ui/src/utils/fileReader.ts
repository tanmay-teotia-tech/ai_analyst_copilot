import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Set up pdf.js worker URL if running in Vite browser environment
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface FileReadResult {
  text: string;
  success: boolean;
  format: string;
  error?: string;
  pageCount?: number;
}

/**
 * Robust Client-Side File Reader for TXT, CSV, JSON, PDF, DOCX, and XLSX files
 */
export async function readTextFromFile(file: File): Promise<string> {
  const result = await parseFileDetails(file);
  return result.text;
}

export async function parseFileDetails(file: File): Promise<FileReadResult> {
  if (!file) {
    return { text: '', success: false, format: 'unknown', error: 'No file provided' };
  }

  const fileName = file.name.toLowerCase();

  try {
    // 1. Plain Text / JSON / MD
    if (fileName.endsWith('.txt') || fileName.endsWith('.json') || fileName.endsWith('.md') || file.type === 'text/plain') {
      const text = await file.text();
      return {
        text,
        success: text.trim().length > 0,
        format: 'TXT',
        error: text.trim().length === 0 ? 'Document is empty' : undefined
      };
    }

    // 2. CSV Files
    if (fileName.endsWith('.csv') || file.type === 'text/csv') {
      const rawText = await file.text();
      const parseResult = Papa.parse(rawText, { skipEmptyLines: true });
      
      let formattedText = rawText;
      if (parseResult.data && parseResult.data.length > 0) {
        // Convert rows to plain text lines
        formattedText = (parseResult.data as string[][])
          .map(row => Array.isArray(row) ? row.join(' | ') : String(row))
          .join('\n');
      }

      return {
        text: formattedText,
        success: formattedText.trim().length > 0,
        format: 'CSV',
        error: formattedText.trim().length === 0 ? 'CSV file is empty' : undefined
      };
    }

    // 3. PDF Files
    if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, useSystemFonts: true });
        const pdf = await loadingTask.promise;
        let pdfText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageStrings = content.items
            .map((item: unknown) => (item && typeof item === 'object' && 'str' in item ? (item as { str: string }).str : ''))
            .filter(Boolean);

          pdfText += `[Page ${pageNum}]\n` + pageStrings.join(' ') + '\n\n';
        }

        const trimmed = pdfText.trim();
        return {
          text: trimmed,
          success: trimmed.length > 0,
          format: 'PDF',
          pageCount: pdf.numPages,
          error: trimmed.length === 0 ? 'Unable to extract text from PDF file' : undefined
        };
      } catch (pdfErr) {
        console.warn('PDF.js parsing error:', pdfErr);
        return {
          text: '',
          success: false,
          format: 'PDF',
          error: 'Unable to reliably extract structured data from this document.'
        };
      }
    }

    // 4. DOCX Files
    if (fileName.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      const arrayBuffer = await file.arrayBuffer();
      try {
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });
        const extractedText = (mammothResult.value || '').trim();

        return {
          text: extractedText,
          success: extractedText.length > 0,
          format: 'DOCX',
          error: extractedText.length === 0 ? 'Unable to extract text from DOCX file' : undefined
        };
      } catch (docxErr) {
        console.warn('Mammoth DOCX parsing error:', docxErr);
        return {
          text: '',
          success: false,
          format: 'DOCX',
          error: 'Unable to reliably extract structured data from this document.'
        };
      }
    }

    // 5. XLSX / XLS Excel Files
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || file.type.includes('spreadsheet')) {
      const arrayBuffer = await file.arrayBuffer();
      try {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        let excelText = '';

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          if (csvText.trim()) {
            excelText += `[Worksheet: ${sheetName}]\n` + csvText + '\n\n';
          }
        });

        const trimmed = excelText.trim();
        return {
          text: trimmed,
          success: trimmed.length > 0,
          format: 'XLSX',
          error: trimmed.length === 0 ? 'Unable to extract text from Excel worksheet' : undefined
        };
      } catch (xlsxErr) {
        console.warn('SheetJS XLSX parsing error:', xlsxErr);
        return {
          text: '',
          success: false,
          format: 'XLSX',
          error: 'Unable to reliably extract structured data from this document.'
        };
      }
    }

    // 6. Generic Fallback for Text-Based Files
    const rawFallback = await file.text();
    return {
      text: rawFallback,
      success: rawFallback.trim().length > 0,
      format: 'TXT',
      error: rawFallback.trim().length === 0 ? 'File appears empty' : undefined
    };

  } catch (err) {
    console.error('File parsing failure for file:', file.name, err);
    return {
      text: '',
      success: false,
      format: 'Unknown',
      error: `Unable to reliably extract structured data from this document (${file.name}).`
    };
  }
}

