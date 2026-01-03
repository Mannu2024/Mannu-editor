
declare const PDFLib: any;
declare const pdfjsLib: any;

export const mergePDFs = async (files: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFLib.PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page: any) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
};

export const rotatePDF = async (file: File, degrees: number): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  pages.forEach((page: any) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(PDFLib.degrees(currentRotation + degrees));
  });
  return await pdfDoc.save();
};

export const splitPDF = async (file: File): Promise<Uint8Array[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const pageCount = pdfDoc.getPageCount();
  const results: Uint8Array[] = [];
  for (let i = 0; i < pageCount; i++) {
    const newDoc = await PDFLib.PDFDocument.create();
    const [page] = await newDoc.copyPages(pdfDoc, [i]);
    newDoc.addPage(page);
    results.push(await newDoc.save());
  }
  return results;
};

export const compressPDF = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  return await pdfDoc.save({ useObjectStreams: true });
};

export const jpgToPdf = async (files: File[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFLib.PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      continue;
    }
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return await pdfDoc.save();
};

export const pdfToJpg = async (file: File): Promise<string[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const imageUrls: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    imageUrls.push(canvas.toDataURL('image/jpeg', 0.8));
  }
  return imageUrls;
};

// Helper to map detected font names to standard PDF fonts
const mapFont = (fontName: string = "") => {
  const name = fontName.toLowerCase();
  if (name.includes('bold') && (name.includes('italic') || name.includes('oblique'))) return PDFLib.StandardFonts.HelveticaBoldOblique;
  if (name.includes('bold')) return PDFLib.StandardFonts.HelveticaBold;
  if (name.includes('italic') || name.includes('oblique')) return PDFLib.StandardFonts.HelveticaOblique;
  if (name.includes('times')) {
    if (name.includes('bold')) return PDFLib.StandardFonts.TimesRomanBold;
    return PDFLib.StandardFonts.TimesRoman;
  }
  return PDFLib.StandardFonts.Helvetica;
};

export const addAnnotationsToPDF = async (file: File, annotations: any[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  
  const SCALE_FACTOR = 1.5;

  for (const ann of annotations) {
    if (ann.page >= pages.length) continue;
    const page = pages[ann.page];
    const { height } = page.getSize();

    if (ann.type === 'text') {
        const pdfX = ann.x / SCALE_FACTOR;
        const pdfY = height - (ann.y / SCALE_FACTOR) - ((ann.fontSize || 24) / SCALE_FACTOR);

        if (ann.isReplacement && ann.maskWidth && ann.maskHeight) {
            page.drawRectangle({
                x: pdfX - 1,
                y: pdfY - 2,
                width: ann.maskWidth / SCALE_FACTOR + 2,
                height: ann.maskHeight / SCALE_FACTOR + 4,
                color: PDFLib.rgb(1, 1, 1),
            });
        }

        const embeddedFont = await pdfDoc.embedFont(mapFont(ann.fontFamily));

        page.drawText(ann.content || '', {
            x: pdfX,
            y: pdfY,
            size: (ann.fontSize || 24) / SCALE_FACTOR,
            font: embeddedFont,
            color: PDFLib.rgb(0, 0, 0), // Use black for consistency unless we can reliably parse original text color
        });
    }
  }
  return await pdfDoc.save();
};

export const downloadBlob = (data: Uint8Array | Blob, fileName: string, type: string) => {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
