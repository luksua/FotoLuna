import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


export const exportStoragePaymentsToExcel = async (payments: any[], fileName = 'Pagos_Almacenamiento', totalAmount?: number) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pagos Almacenamiento');

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 15 },
        { header: 'Fecha', key: 'date', width: 22 },
        { header: 'Monto', key: 'amount', width: 22 },
        { header: 'Estado', key: 'status', width: 18 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF805fa6' } };
        cell.alignment = { horizontal: 'center', vertical: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // (Se añadirá la fila de ingresos totales debajo de la tabla, después de listar los pagos)

    const statusMap: Record<string, string> = {
        approved: 'Aprobado',
        pending: 'Pendiente',
        rejected: 'Rechazado',
        in_process: 'Rechazado',
    };

    payments.forEach((p) => {
        const rawStatus = (p.paymentStatus ?? '').toLowerCase();
        const statusText = statusMap[rawStatus] ?? p.paymentStatus ?? '';
        const row = worksheet.addRow({
            id: Number(p.paymentId ?? p.id ?? ''),
            date: p.paymentDate ? new Date(p.paymentDate).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '',
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
            cell.alignment = { vertical: 'center' };
        });
    });

    // Agregar fila de ingresos totales si se proporciona (debajo de la tabla)
    if (typeof totalAmount === 'number') {
        // fila vacía separadora
        worksheet.addRow({ id: '', date: '', amount: '', status: '' });
        const totalRow = worksheet.addRow({ id: '', date: '', amount: totalAmount, status: 'Ingresos Totales' });
        totalRow.font = { bold: true, color: { argb: 'FF000000' }, size: 12 };
        totalRow.getCell('amount').numFmt = '[$$-es-CO]#,##0.00';
        totalRow.getCell('status').alignment = { horizontal: 'center', vertical: 'center' };
    }

    // Formato de moneda para columna Monto
    try {
        worksheet.getColumn('amount').numFmt = '[$$-es-CO]#,##0.00';
    } catch {}
    // Formato entero para columna ID
    try {
        worksheet.getColumn('id').numFmt = '0';
    } catch {}

    // Ajuste automático de columnas teniendo en cuenta formato de moneda y anchos mínimos
    const minWidths: Record<string, number> = { id: 8, date: 18, amount: 16, status: 12 };
    const currencyFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 });

    worksheet.columns.forEach((col: any) => {
        let maxLength = 0;
        col.eachCell?.({ includeEmpty: true }, (cell: any) => {
            let text = '';
            if (col.key === 'amount' && typeof cell.value === 'number') {
                try {
                    text = currencyFormatter.format(cell.value);
                } catch (e) {
                    text = String(cell.value);
                }
            } else {
                // preferir cell.text si existe (ya formateado por ExcelJS), sino cell.value
                if (cell.text !== undefined && cell.text !== null) text = String(cell.text);
                else if (cell.value !== undefined && cell.value !== null) text = String(cell.value);
                else text = '';
            }

            // contar longitud real (sin saltos)
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
