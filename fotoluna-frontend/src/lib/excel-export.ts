import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

type Data = Record<string, any>[];

// Colores FotoLuna
const COLORS = {
    primaryPurple: 'FF805FA6',
    white: 'FFFFFFFF',
    darkText: 'FF000000',
};

export const exportToExcel = async (data: Data, fileName: string): Promise<void> => {
    if (!data || data.length === 0) {
        console.warn('No data to export.');
        return;
    }

    const headers = Object.keys(data[0]);
    const generatedAt = new Date().toLocaleString('es-CO');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Definir columnas
    worksheet.columns = headers.map((key) => ({
        key,
        width: 15,
    }));

    const totalColumns = worksheet.columns.length;
    const lastColumnLetter = worksheet.getColumn(totalColumns).letter; // Ej: D, E...

    // 1) Título (fila 1)
    const titleRow = worksheet.getRow(1);
    worksheet.mergeCells(`A1:${lastColumnLetter}1`);
    titleRow.getCell(1).value = fileName || 'Reporte';
    titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: COLORS.darkText } };
    titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // 2) Fecha (fila 2)
    const dateRow = worksheet.getRow(2);
    worksheet.mergeCells(`A2:${lastColumnLetter}2`);
    dateRow.getCell(1).value = `Fecha de generación: ${generatedAt}`;
    dateRow.getCell(1).font = { italic: true, size: 11, color: { argb: COLORS.darkText } };
    dateRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // 3) Fila 3 vacía

    // 4) Encabezados (fila 4)
    const headerRowIndex = 4;
    const headerRow = worksheet.getRow(headerRowIndex);
    headers.forEach((h, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = h;
        cell.font = { bold: true, size: 12, color: { argb: COLORS.white } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryPurple } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // 5) Datos (desde fila 5)
    data.forEach((rowObj) => {
        const row = worksheet.addRow(
            headers.reduce<Record<string, any>>((acc, key) => {
                acc[key] = rowObj[key];
                return acc;
            }, {})
        );

        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.alignment = { vertical: 'middle', wrapText: true };
        });
    });

    // 6) Auto-ajuste de columnas
    worksheet.columns.forEach((col: any) => {
        let maxLength = 0;
        col.eachCell?.({ includeEmpty: true }, (cell: any) => {
            const text =
                cell.text !== undefined && cell.text !== null
                    ? String(cell.text)
                    : cell.value !== undefined && cell.value !== null
                    ? String(cell.value)
                    : '';
            const len = text.replace(/\r?\n/g, ' ').length;
            if (len > maxLength) maxLength = len;
        });
        col.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // 7) Descargar
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
