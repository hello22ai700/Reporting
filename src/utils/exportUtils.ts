import { GeneratedReport, THEME_CONFIGS } from '../types/report';
import { jsPDF } from 'jspdf';
import * as docx from 'docx';
import PptxGenJS from 'pptxgenjs';
import * as XLSX from 'xlsx';

// Helper to trigger browser download
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

// Clean filename generator
export function getSafeFilename(title: string, ext: string): string {
  const clean = title.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 40);
  return `${clean || 'Report'}_${new Date().toISOString().slice(0, 10)}.${ext}`;
}

/**
 * 1. PDF Export
 * Uses jsPDF with structured vector layout, clean typography, KPI blocks, and tables
 */
export async function exportToPDF(report: GeneratedReport): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const theme = THEME_CONFIGS[report.theme] || THEME_CONFIGS['executive-blue'];
  const hex = theme.primaryHex;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let cursorY = margin;

  // Header Banner
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(report.title.slice(0, 50), margin, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(report.subtitle.slice(0, 70), margin, 21);

  // Metadata line
  cursorY = 36;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  const metaText = `Generated: ${report.date} | Prepared By: ${report.preparedBy || 'ReportCraft AI'} | ${report.preparedFor ? 'For: ' + report.preparedFor : ''}`;
  doc.text(metaText, margin, cursorY);
  cursorY += 6;

  // Thin separator
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // Executive Summary Card
  if (report.executiveSummary) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.8);
    
    // Split text to measure height
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(report.executiveSummary, pageWidth - margin * 2 - 12);
    const boxHeight = Math.max(22, summaryLines.length * 5 + 12);

    doc.rect(margin, cursorY, pageWidth - margin * 2, boxHeight, 'F');
    // Accent left stripe
    doc.setFillColor(r, g, b);
    doc.rect(margin, cursorY, 3, boxHeight, 'F');

    doc.setTextColor(r, g, b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', margin + 6, cursorY + 6);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(summaryLines, margin + 6, cursorY + 12);

    cursorY += boxHeight + 10;
  }

  // Iterate Sections
  for (const section of report.sections) {
    // Check if new page is needed
    if (cursorY > pageHeight - 35) {
      doc.addPage();
      cursorY = margin + 5;
    }

    // Section Header
    doc.setFillColor(r, g, b);
    doc.rect(margin, cursorY, 2.5, 6, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title.toUpperCase(), margin + 5, cursorY + 5);
    cursorY += 9;

    if (section.content) {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(section.content, pageWidth - margin * 2);
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 4.5 + 4;
    }

    // 1. Metrics Section
    if (section.type === 'metrics' && section.metrics && section.metrics.length > 0) {
      const cardWidth = (pageWidth - margin * 2 - (section.metrics.length - 1) * 4) / Math.min(section.metrics.length, 4);
      const cardHeight = 20;

      section.metrics.forEach((metric, idx) => {
        const col = idx % 4;
        const cardX = margin + col * (cardWidth + 4);
        
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(cardX, cursorY, cardWidth, cardHeight, 2, 2, 'FD');

        // Metric label
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(metric.label.slice(0, 22), cardX + 3, cursorY + 5);

        // Metric value
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(metric.value, cardX + 3, cursorY + 12);

        // Metric change / note
        if (metric.change) {
          const isUp = metric.trend === 'up' || metric.change.includes('+');
          doc.setTextColor(isUp ? 22 : 220, isUp ? 101 : 38, isUp ? 52 : 38);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.text(metric.change, cardX + 3, cursorY + 17);
        }
      });

      cursorY += cardHeight + 8;
    }

    // 2. Chart Section (Numeric Table & Trend summary representation in PDF)
    if (section.type === 'chart' && section.chart) {
      const ch = section.chart;
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, cursorY, pageWidth - margin * 2, 6, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Chart: ${ch.title} (${ch.type.toUpperCase()})`, margin + 3, cursorY + 4.5);
      cursorY += 8;

      // Draw horizontal bar graph representation
      const maxVal = Math.max(...ch.data.map(d => d.value), 1);
      ch.data.forEach((point) => {
        if (cursorY > pageHeight - 20) {
          doc.addPage();
          cursorY = margin + 5;
        }

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(point.label.slice(0, 20), margin, cursorY + 3.5);

        // Draw bar
        const barStartX = margin + 35;
        const availableWidth = pageWidth - margin * 2 - 55;
        const barWidth = Math.max(2, (point.value / maxVal) * availableWidth);

        doc.setFillColor(r, g, b);
        doc.roundedRect(barStartX, cursorY, barWidth, 4, 1, 1, 'F');

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(String(point.value), barStartX + barWidth + 3, cursorY + 3.5);

        cursorY += 6.5;
      });

      if (ch.summaryNote) {
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'italic');
        doc.text(`Note: ${ch.summaryNote}`, margin, cursorY + 3);
        cursorY += 6;
      }
      cursorY += 4;
    }

    // 3. Table Section
    if (section.type === 'table' && section.table) {
      const tbl = section.table;
      const colCount = Math.max(tbl.headers.length, 1);
      const colWidth = (pageWidth - margin * 2) / colCount;

      // Table Header
      doc.setFillColor(r, g, b);
      doc.rect(margin, cursorY, pageWidth - margin * 2, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');

      tbl.headers.forEach((header, idx) => {
        doc.text(String(header).slice(0, 18), margin + idx * colWidth + 2, cursorY + 4.8);
      });
      cursorY += 7;

      // Table Rows
      tbl.rows.forEach((row, rowIdx) => {
        if (cursorY > pageHeight - 20) {
          doc.addPage();
          cursorY = margin + 5;
        }

        doc.setFillColor(rowIdx % 2 === 0 ? 255 : 248, rowIdx % 2 === 0 ? 255 : 250, rowIdx % 2 === 0 ? 255 : 252);
        doc.rect(margin, cursorY, pageWidth - margin * 2, 6, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, cursorY + 6, pageWidth - margin, cursorY + 6);

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(7.8);
        doc.setFont('helvetica', 'normal');

        row.forEach((cell, cellIdx) => {
          if (cellIdx < colCount) {
            doc.text(String(cell).slice(0, 20), margin + cellIdx * colWidth + 2, cursorY + 4.2);
          }
        });

        cursorY += 6;
      });

      cursorY += 6;
    }

    // 4. Bullets / Recommendations
    if (section.bullets && section.bullets.length > 0) {
      section.bullets.forEach((bullet) => {
        if (cursorY > pageHeight - 20) {
          doc.addPage();
          cursorY = margin + 5;
        }

        doc.setFillColor(r, g, b);
        doc.circle(margin + 2, cursorY - 1, 1, 'F');

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        const bulletLines = doc.splitTextToSize(bullet, pageWidth - margin * 2 - 8);
        doc.text(bulletLines, margin + 6, cursorY);
        cursorY += bulletLines.length * 4.5 + 2;
      });
      cursorY += 4;
    }

    cursorY += 4;
  }

  // Footer for each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.text(`ReportCraft AI • Confidential`, margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 8);
  }

  doc.save(getSafeFilename(report.title, 'pdf'));
}

/**
 * 2. Word (DOCX) Export
 * Generates genuine Microsoft Word format using docx library with tables, headers, and colored accents
 */
export async function exportToWord(report: GeneratedReport): Promise<void> {
  const theme = THEME_CONFIGS[report.theme] || THEME_CONFIGS['executive-blue'];
  const hexColor = theme.primaryHex;

  const children: any[] = [];

  // Title
  children.push(
    new docx.Paragraph({
      text: report.title,
      heading: docx.HeadingLevel.HEADING_1,
      spacing: { after: 120, before: 100 },
    }),
    new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: report.subtitle,
          italics: true,
          color: '64748B',
          size: 22,
        }),
      ],
      spacing: { after: 180 },
    }),
    new docx.Paragraph({
      children: [
        new docx.TextRun({ text: `Date: ${report.date}   |   Prepared By: ${report.preparedBy || 'ReportCraft AI'}`, size: 18, color: '94A3B8' }),
      ],
      spacing: { after: 240 },
    })
  );

  // Executive Summary
  if (report.executiveSummary) {
    children.push(
      new docx.Paragraph({
        text: 'Executive Summary',
        heading: docx.HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: report.executiveSummary,
            size: 21,
          }),
        ],
        spacing: { after: 240 },
      })
    );
  }

  // Sections
  for (const sec of report.sections) {
    children.push(
      new docx.Paragraph({
        text: sec.title,
        heading: docx.HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 120 },
      })
    );

    if (sec.content) {
      children.push(
        new docx.Paragraph({
          text: sec.content,
          spacing: { after: 140 },
        })
      );
    }

    // Metrics Table
    if (sec.type === 'metrics' && sec.metrics && sec.metrics.length > 0) {
      const metricCells = sec.metrics.map(
        m =>
          new docx.TableCell({
            width: { size: 100 / sec.metrics!.length, type: docx.WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: { top: 120, bottom: 120, left: 120, right: 120 },
            children: [
              new docx.Paragraph({
                children: [new docx.TextRun({ text: m.label, bold: true, size: 18, color: '64748B' })],
              }),
              new docx.Paragraph({
                children: [new docx.TextRun({ text: m.value, bold: true, size: 28, color: hexColor })],
              }),
              new docx.Paragraph({
                children: [new docx.TextRun({ text: m.change || '', size: 16, color: '10B981' })],
              }),
            ],
          })
      );

      children.push(
        new docx.Table({
          width: { size: 100, type: docx.WidthType.PERCENTAGE },
          rows: [new docx.TableRow({ children: metricCells })],
        }),
        new docx.Paragraph({ spacing: { after: 200 } })
      );
    }

    // Chart Data Summary Table in DOCX
    if (sec.type === 'chart' && sec.chart) {
      const ch = sec.chart;
      const chartRows = [
        new docx.TableRow({
          children: [
            new docx.TableCell({
              shading: { fill: hexColor },
              children: [new docx.Paragraph({ children: [new docx.TextRun({ text: 'Category / Period', bold: true, color: 'FFFFFF' })] })],
            }),
            new docx.TableCell({
              shading: { fill: hexColor },
              children: [new docx.Paragraph({ children: [new docx.TextRun({ text: 'Reported Value', bold: true, color: 'FFFFFF' })] })],
            }),
          ],
        }),
        ...ch.data.map(
          d =>
            new docx.TableRow({
              children: [
                new docx.TableCell({ children: [new docx.Paragraph(d.label)] }),
                new docx.TableCell({ children: [new docx.Paragraph(String(d.value))] }),
              ],
            })
        ),
      ];

      children.push(
        new docx.Table({
          width: { size: 100, type: docx.WidthType.PERCENTAGE },
          rows: chartRows,
        }),
        new docx.Paragraph({ spacing: { after: 180 } })
      );
    }

    // Table Section
    if (sec.type === 'table' && sec.table) {
      const tbl = sec.table;
      const headerCells = tbl.headers.map(
        h =>
          new docx.TableCell({
            shading: { fill: hexColor },
            children: [new docx.Paragraph({ children: [new docx.TextRun({ text: String(h), bold: true, color: 'FFFFFF' })] })],
          })
      );

      const dataRows = tbl.rows.map(
        row =>
          new docx.TableRow({
            children: row.map(
              cell =>
                new docx.TableCell({
                  children: [new docx.Paragraph(String(cell))],
                })
            ),
          })
      );

      children.push(
        new docx.Table({
          width: { size: 100, type: docx.WidthType.PERCENTAGE },
          rows: [new docx.TableRow({ children: headerCells }), ...dataRows],
        }),
        new docx.Paragraph({ spacing: { after: 200 } })
      );
    }

    // Bullets
    if (sec.bullets && sec.bullets.length > 0) {
      sec.bullets.forEach(b => {
        children.push(
          new docx.Paragraph({
            text: b,
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        );
      });
      children.push(new docx.Paragraph({ spacing: { after: 140 } }));
    }
  }

  const doc = new docx.Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await docx.Packer.toBlob(doc);
  triggerDownload(blob, getSafeFilename(report.title, 'docx'));
}

/**
 * 3. PowerPoint (PPTX) Export
 * Generates real presentation slides using pptxgenjs
 */
export async function exportToPowerPoint(report: GeneratedReport): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';

  const theme = THEME_CONFIGS[report.theme] || THEME_CONFIGS['executive-blue'];
  const hex = theme.primaryHex;

  // Slide 1: Cover Slide
  const slide1 = pptx.addSlide();
  // Branded top bar
  slide1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: hex } });
  
  slide1.addText(report.title, {
    x: 0.8,
    y: 2.2,
    w: 11.5,
    h: 1.5,
    fontSize: 34,
    bold: true,
    color: '0F172A',
    breakLine: true,
  });

  slide1.addText(report.subtitle, {
    x: 0.8,
    y: 3.8,
    w: 11.5,
    h: 0.8,
    fontSize: 18,
    color: '475569',
  });

  slide1.addText(`Date: ${report.date}   |   Prepared By: ${report.preparedBy || 'ReportCraft AI'}`, {
    x: 0.8,
    y: 5.6,
    w: 11.5,
    h: 0.5,
    fontSize: 14,
    color: '94A3B8',
  });

  // Slide 2: Executive Summary
  if (report.executiveSummary) {
    const slide2 = pptx.addSlide();
    slide2.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.35, fill: { color: hex } });
    slide2.addText('Executive Summary', { x: 0.8, y: 0.6, fontSize: 24, bold: true, color: '0F172A' });
    slide2.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.3, w: 11.5, h: 4.8, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
    slide2.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.3, w: 0.15, h: 4.8, fill: { color: hex } });
    slide2.addText(report.executiveSummary, {
      x: 1.2,
      y: 1.6,
      w: 10.8,
      h: 4.2,
      fontSize: 16,
      color: '1E293B',
      lineSpacing: 24,
    });
  }

  // Iterate report sections to create slides
  for (const sec of report.sections) {
    if (sec.type === 'metrics' && sec.metrics && sec.metrics.length > 0) {
      const slide = pptx.addSlide();
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.35, fill: { color: hex } });
      slide.addText(sec.title, { x: 0.8, y: 0.6, fontSize: 24, bold: true, color: '0F172A' });

      const count = Math.min(sec.metrics.length, 4);
      const cardW = 2.6;
      const spacing = 0.3;

      sec.metrics.slice(0, 4).forEach((m, idx) => {
        const x = 0.8 + idx * (cardW + spacing);
        slide.addShape(pptx.ShapeType.roundRect, {
          x,
          y: 2.0,
          w: cardW,
          h: 3.2,
          fill: { color: 'F8FAFC' },
          line: { color: 'E2E8F0', width: 1 },
        });

        slide.addText(m.label, { x: x + 0.2, y: 2.3, w: cardW - 0.4, h: 0.6, fontSize: 13, bold: true, color: '64748B' });
        slide.addText(m.value, { x: x + 0.2, y: 3.0, w: cardW - 0.4, h: 1.0, fontSize: 26, bold: true, color: hex });
        if (m.change) {
          slide.addText(m.change, { x: x + 0.2, y: 4.1, w: cardW - 0.4, h: 0.5, fontSize: 13, bold: true, color: '10B981' });
        }
      });
    }

    if (sec.type === 'chart' && sec.chart) {
      const slide = pptx.addSlide();
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.35, fill: { color: hex } });
      slide.addText(sec.chart.title || sec.title, { x: 0.8, y: 0.6, fontSize: 24, bold: true, color: '0F172A' });

      // Use pptx native bar chart!
      const chartData = [
        {
          name: sec.chart.title || 'Metrics',
          labels: sec.chart.data.map(d => d.label),
          values: sec.chart.data.map(d => d.value),
        },
      ];

      slide.addChart(pptx.ChartType.bar, chartData, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        h: 4.8,
        barDir: 'col',
        chartColors: [hex],
        showValue: true,
      });
    }

    if (sec.type === 'table' && sec.table) {
      const slide = pptx.addSlide();
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.35, fill: { color: hex } });
      slide.addText(sec.title, { x: 0.8, y: 0.6, fontSize: 24, bold: true, color: '0F172A' });

      const tbl = sec.table;
      const rows: any[][] = [];

      // Header row
      rows.push(
        tbl.headers.map(h => ({
          text: String(h),
          options: { fill: hex, color: 'FFFFFF', bold: true, fontSize: 12 },
        }))
      );

      // Data rows
      tbl.rows.slice(0, 8).forEach(row => {
        rows.push(
          row.map(cell => ({
            text: String(cell),
            options: { fill: 'FFFFFF', color: '1E293B', fontSize: 11 },
          }))
        );
      });

      slide.addTable(rows, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        colW: Array(tbl.headers.length).fill(11.5 / tbl.headers.length),
        border: { color: 'E2E8F0', pt: 1 },
      });
    }

    if (sec.type === 'recommendations' || (sec.bullets && sec.bullets.length > 0)) {
      const slide = pptx.addSlide();
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.35, fill: { color: hex } });
      slide.addText(sec.title, { x: 0.8, y: 0.6, fontSize: 24, bold: true, color: '0F172A' });

      const bullets = sec.bullets || [];
      const textItems = bullets.map(b => ({
        text: b + '\n',
        options: { fontSize: 16, color: '334155', bullet: true, lineSpacing: 24 },
      }));

      slide.addText(textItems, { x: 0.8, y: 1.6, w: 11.5, h: 4.8 });
    }
  }

  await pptx.writeFile({ fileName: getSafeFilename(report.title, 'pptx') });
}

/**
 * 4. Excel (XLSX) Export
 * Generates multi-sheet structured workbook with Summary, KPIs, Tables, and Charts
 */
export function exportToExcel(report: GeneratedReport): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Executive Overview & KPIs
  const overviewRows: any[][] = [
    ['REPORT TITLE', report.title],
    ['SUBTITLE', report.subtitle],
    ['DATE', report.date],
    ['PREPARED BY', report.preparedBy || 'ReportCraft AI'],
    ['PREPARED FOR', report.preparedFor || 'Stakeholders'],
    [],
    ['EXECUTIVE SUMMARY'],
    [report.executiveSummary],
    [],
    ['KEY PERFORMANCE INDICATORS (KPIS)'],
    ['Metric Name', 'Value', 'Change / Variance', 'Trend', 'Note'],
  ];

  // Extract all metrics across sections
  report.sections.forEach(sec => {
    if (sec.metrics) {
      sec.metrics.forEach(m => {
        overviewRows.push([m.label, m.value, m.change || '', m.trend || '', m.note || '']);
      });
    }
  });

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewRows);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Summary & KPIs');

  // Sheet 2: Data Tables
  let hasTable = false;
  report.sections.forEach((sec, idx) => {
    if (sec.table) {
      hasTable = true;
      const tableRows = [
        [sec.table.title || `Table ${idx + 1}`],
        [],
        sec.table.headers,
        ...sec.table.rows,
      ];
      const wsTable = XLSX.utils.aoa_to_sheet(tableRows);
      const sheetName = (sec.table.title || `Table_${idx + 1}`).replace(/[\\/?*[\]]/g, '').slice(0, 25);
      XLSX.utils.book_append_sheet(wb, wsTable, sheetName);
    }
  });

  // Sheet 3: Visual Datasets
  const chartRows: any[][] = [['Chart Title', 'Category / Label', 'Value', 'Benchmark']];
  report.sections.forEach(sec => {
    if (sec.chart) {
      sec.chart.data.forEach(d => {
        chartRows.push([sec.chart?.title || sec.title, d.label, d.value, d.benchmark || '']);
      });
    }
  });

  if (chartRows.length > 1) {
    const wsChart = XLSX.utils.aoa_to_sheet(chartRows);
    XLSX.utils.book_append_sheet(wb, wsChart, 'Chart Datasets');
  }

  // Fallback if no table existed
  if (!hasTable) {
    const blankRows = [['No standalone tables found in report']];
    const wsBlank = XLSX.utils.aoa_to_sheet(blankRows);
    XLSX.utils.book_append_sheet(wb, wsBlank, 'Data Details');
  }

  XLSX.writeFile(wb, getSafeFilename(report.title, 'xlsx'));
}

/**
 * 5. Standalone HTML Export (Print-ready & Web-viewable)
 */
export function exportToHTML(report: GeneratedReport): void {
  const theme = THEME_CONFIGS[report.theme] || THEME_CONFIGS['executive-blue'];
  const hex = theme.primaryHex;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${report.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    .header { border-bottom: 3px solid #${hex}; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { color: #0f172a; margin: 0 0 8px 0; font-size: 28px; }
    .subtitle { color: #64748b; font-size: 16px; margin: 0 0 12px 0; }
    .meta { font-size: 13px; color: #94a3b8; }
    .summary-card { background: #f8fafc; border-left: 4px solid #${hex}; padding: 18px 20px; border-radius: 4px; margin: 24px 0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 20px 0; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .kpi-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
    .kpi-val { font-size: 24px; font-weight: 700; color: #${hex}; }
    .kpi-change { font-size: 12px; color: #10b981; font-weight: 600; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #${hex}; color: white; text-align: left; padding: 10px 12px; font-size: 13px; }
    td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    tr:nth-child(even) { background: #f8fafc; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    @media print { body { max-width: 100%; margin: 0; padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${report.title}</h1>
    <div class="subtitle">${report.subtitle}</div>
    <div class="meta">Date: ${report.date} | Prepared By: ${report.preparedBy || 'ReportCraft AI'}</div>
  </div>

  <div class="summary-card">
    <strong style="color: #${hex}; text-transform: uppercase; font-size: 12px; display: block; margin-bottom: 6px;">Executive Summary</strong>
    <p style="margin: 0;">${report.executiveSummary}</p>
  </div>

  ${report.sections.map(sec => `
    <div style="margin-top: 32px;">
      <h2 style="font-size: 20px; border-left: 4px solid #${hex}; padding-left: 10px; margin-bottom: 12px;">${sec.title}</h2>
      ${sec.content ? `<p style="color: #475569;">${sec.content}</p>` : ''}
      
      ${sec.metrics ? `
        <div class="kpi-grid">
          ${sec.metrics.map(m => `
            <div class="kpi-card">
              <div class="kpi-label">${m.label}</div>
              <div class="kpi-val">${m.value}</div>
              ${m.change ? `<div class="kpi-change">${m.change}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${sec.table ? `
        <table>
          <thead>
            <tr>${sec.table.headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${sec.table.rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      ` : ''}

      ${sec.bullets ? `
        <ul>
          ${sec.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('')}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  triggerDownload(blob, getSafeFilename(report.title, 'html'));
}
