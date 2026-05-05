// app/api/admin/pdf/route.ts
import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function POST(req: Request) {
  try {
    const { orders, stats } = await req.json();

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: 'Invalid orders data' }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let { height } = page.getSize();
    let y = height - 50;

    // Header
    page.drawText('SHEGA CAFE - SALES REPORT', {
      x: 50,
      y,
      size: 24,
      font: fontBold,
      color: rgb(0.1, 0.3, 0.6),
    });

    y -= 30;
    page.drawText(`Report Generated: ${new Date().toLocaleString()}`, {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Stats
    if (stats) {
      y -= 50;
      page.drawRectangle({
        x: 50,
        y: y - 80,
        width: 500,
        height: 100,
        color: rgb(0.95, 0.96, 0.98),
        borderWidth: 1,
        borderColor: rgb(0.8, 0.8, 0.8),
      });

      page.drawText('BUSINESS SUMMARY', {
        x: 60,
        y: y - 20,
        size: 14,
        font: fontBold,
      });

      const statRows = [
        `Total Revenue: ${stats.totalRevenue?.toLocaleString() || 0} ETB`,
        `Total Profit: ${stats.totalProfit?.toLocaleString() || 0} ETB`,
        `Best Seller: ${stats.bestSeller || 'N/A'}`,
        `Total Orders: ${orders.length}`,
      ];

      statRows.forEach((text, i) => {
        page.drawText(text, {
          x: 60 + (i % 2) * 240,
          y: y - 45 - Math.floor(i / 2) * 20,
          size: 10,
          font,
        });
      });
      y -= 100;
    }

    // Table
    y -= 40;
    const headers = ['ID', 'Customer', 'Table', 'Total', 'Items'];
    const xPositions = [50, 90, 160, 220, 310];
    headers.forEach((h, i) => {
      page.drawText(h, { x: xPositions[i], y, size: 10, font: fontBold });
    });

    y -= 10;
    page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 1 });

    y -= 20;
    for (const o of orders) {
      if (y < 60) {
        page = pdfDoc.addPage([600, 800]);
        y = 750;
      }

      page.drawText(`#${o.id}`, { x: xPositions[0], y, size: 9, font });
      page.drawText(String(o.customerName || 'Guest').slice(0, 10), { x: xPositions[1], y, size: 9, font });
      page.drawText(String(o.tableNumber || '-'), { x: xPositions[2], y, size: 9, font });
      page.drawText(`${o.total?.toFixed(0) || 0} ETB`, { x: xPositions[3], y, size: 9, font: fontBold });

      // Itemized safety
      const items = o.items || [];
      const itemText = items.map((i: any) => `${i.menuItem?.name || 'Item'} (x${i.quantity})`).join(', ');
      const wrapped = itemText.length > 45 ? itemText.slice(0, 42) + '...' : itemText;
      page.drawText(wrapped, { x: xPositions[4], y, size: 8, font, color: rgb(0.3, 0.3, 0.3) });

      y -= 20;
      page.drawLine({ start: { x: 50, y: y + 10 }, end: { x: 550, y: y + 10 }, thickness: 0.1, color: rgb(0.8, 0.8, 0.8) });
    }

    const pdfBytes = await pdfDoc.save();
    
    // IMPORTANT: Return as a proper response with correct headers
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBytes.byteLength.toString(),
        'Content-Disposition': 'attachment; filename="Sales_Report.pdf"',
      },
    });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}