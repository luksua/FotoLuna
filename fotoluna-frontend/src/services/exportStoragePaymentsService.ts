import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportStoragePaymentsToExcel = async (
    payments: any[],
    fileName = 'Pagos_Almacenamiento',
    totalAmount?: number
) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pagos Almacenamiento');

    // Definimos columnas SIN header automático
    worksheet.columns = [
        { key: 'id',     width: 15 },
        { key: 'date',   width: 22 },
        { key: 'amount', width: 22 },
        { key: 'status', width: 18 },
    ];

    const totalColumns = worksheet.columns.length;
    const lastColumnLetter = worksheet.getColumn(totalColumns).letter; // Ej: D

    // 1) TÍTULO (fila 1)
    const titleRow = worksheet.getRow(1);
    worksheet.mergeCells(`A1:${lastColumnLetter}1`);
    titleRow.getCell(1).value = 'Reporte de Pagos de Almacenamiento';
    titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FF000000' } };
    titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // 2) FECHA DE GENERACIÓN (fila 2)
    const now = new Date();
    const generatedAt = now.toLocaleString('es-CO');
    const dateRow = worksheet.getRow(2);
    worksheet.mergeCells(`A2:${lastColumnLetter}2`);
    dateRow.getCell(1).value = `Fecha de generación: ${generatedAt}`;
    dateRow.getCell(1).font = { italic: true, size: 11, color: { argb: 'FF000000' } };
    dateRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // 3) Fila 3 vacía (separador)

    // 4) ENCABEZADOS (fila 4)
    const headerRowIndex = 4;
    const headerRow = worksheet.getRow(headerRowIndex);
    const headers = ['ID', 'Fecha', 'Monto', 'Estado'];

    headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1); // 1-based
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF805fa6' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // Mapa de estados
    const statusMap: Record<string, string> = {
        approved: 'Aprobado',
        pending: 'Pendiente',
        rejected: 'Rechazado',
        in_process: 'Rechazado',
    };

    // 5) FILAS DE DATOS (a partir de la fila 5)
    payments.forEach((p) => {
        const rawStatus = (p.paymentStatus ?? '').toLowerCase();
        const statusText = statusMap[rawStatus] ?? p.paymentStatus ?? '';

        const row = worksheet.addRow({
            id: Number(p.paymentId ?? p.id ?? ''),
            date: p.paymentDate
                ? new Date(p.paymentDate).toLocaleString('es-CO', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                  })
                : '',
            amount: Number(p.amount ?? 0),
            status: statusText,
        });

        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.alignment = { vertical: 'middle' };
        });
    });

    // 6) Fila de ingresos totales (debajo de la tabla)
    if (typeof totalAmount === 'number') {
        worksheet.addRow({ id: '', date: '', amount: '', status: '' }); // fila separadora

        const totalRow = worksheet.addRow({
            id: '',
            date: '',
            amount: totalAmount,
            status: 'Ingresos Totales',
        });

        totalRow.font = { bold: true, color: { argb: 'FF000000' }, size: 12 };
        totalRow.getCell('amount').numFmt = '[$$-es-CO]#,##0.00';
        totalRow.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };
    }

    // 7) Formato de moneda para columna Monto
    try {
        worksheet.getColumn('amount').numFmt = '[$$-es-CO]#,##0.00';
    } catch {
        // ignore
    }

    // Formato entero para columna ID
    try {
        worksheet.getColumn('id').numFmt = '0';
    } catch {
        // ignore
    }

    // 8) Ajuste automático de columnas
    const minWidths: Record<string, number> = { id: 8, date: 18, amount: 16, status: 12 };
    const currencyFormatter = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
    });

    worksheet.columns.forEach((col: any) => {
        let maxLength = 0;
        col.eachCell?.({ includeEmpty: true }, (cell: any) => {
            let text = '';

            if (col.key === 'amount' && typeof cell.value === 'number') {
                try {
                    text = currencyFormatter.format(cell.value);
                } catch {
                    text = String(cell.value);
                }
            } else if (cell.text !== undefined && cell.text !== null) {
                text = String(cell.text);
            } else if (cell.value !== undefined && cell.value !== null) {
                text = String(cell.value);
            } else {
                text = '';
            }

            const cellLength = text.replace(/\r?\n/g, ' ').length;
            if (cellLength > maxLength) maxLength = cellLength;
        });

        const calculated = Math.min(maxLength + 2, 50);
        const minW = minWidths[col.key as string] ?? 10;
        col.width = Math.max(minW, calculated);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
