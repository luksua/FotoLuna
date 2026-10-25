import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportAppointmentsToExcel = async (appointments: any[], fileName = 'Citas') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Citas');

    // 1. Definir columnas (SOLO key y width, SIN header)
    worksheet.columns = [
        { key: 'date',         width: 14 },
        { key: 'time',         width: 10 },
        { key: 'clientName',   width: 22 },
        { key: 'eventName',    width: 24 },
        { key: 'employeeName', width: 22 },
        { key: 'place',        width: 22 },
        { key: 'comment',      width: 28 },
        { key: 'status',       width: 22 },
    ];

    const totalColumns = worksheet.columns.length;
    const lastColumnLetter = worksheet.getColumn(totalColumns).letter; // Ej: H

    // 2. TÍTULO DEL REPORTE (fila 1)
    const titleRow = worksheet.getRow(1);
    worksheet.mergeCells(`A1:${lastColumnLetter}1`);
    titleRow.getCell(1).value = 'Reporte de Citas';
    titleRow.getCell(1).font = { bold: true, size: 16 };
    titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // 3. FECHA DE GENERACIÓN (fila 2)
    const now = new Date();
    const generatedAt = now.toLocaleString('es-CO'); // Ajusta el locale si quieres

    const dateRow = worksheet.getRow(2);
    worksheet.mergeCells(`A2:${lastColumnLetter}2`);
    dateRow.getCell(1).value = `Fecha de generación: ${generatedAt}`;
    dateRow.getCell(1).font = { italic: true, size: 11 };
    dateRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // 4. (fila 3 vacía para separar visualmente)
    // No hace falta hacer nada, simplemente la dejamos vacía

    // 5. ENCABEZADOS (fila 4)
    const headerRowIndex = 4;
    const headerRow = worksheet.getRow(headerRowIndex);
    headerRow.values = [
        'Fecha',
        'Hora',
        'Cliente',
        'Evento',
        'Fotógrafo',
        'Lugar',
        'Comentario',
        'Estado',
    ];

    headerRow.eachCell((cell) => {
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

    // 6. Mapa de estados (igual que lo tenías)
    const statusMap: Record<string, string> = {
        'pending_assignment': 'Pendiente asignación',
        'pending assignment': 'Pendiente asignación',
        'Pending_assignment': 'Pendiente asignación',
        'scheduled': 'Programada',
        'Scheduled': 'Programada',
        'completed': 'Completada',
        'Completed': 'Completada',
        'cancelled': 'Cancelada',
        'Cancelled': 'Cancelada',
        'pending confirmation': 'Pendiente de confirmación',
        'Pending confirmation': 'Pendiente de confirmación',
        'pending_confirmation': 'Pendiente de confirmación',
        'Pending_confirmation': 'Pendiente de confirmación',
    };

    // 7. Filas de datos (a partir de la fila 5)
    appointments.forEach((apt) => {
        const statusRaw = (apt.status ?? '').toString().toLowerCase().trim();
        const statusText =
            statusMap[statusRaw] ||
            statusMap[statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)] ||
            statusRaw;

        const row = worksheet.addRow({
            date: apt.date ?? '',
            time: apt.time ?? '',
            clientName: apt.clientName ?? '',
            eventName: apt.eventName ?? '',
            employeeName: apt.employeeName ?? (apt.employeeId ? 'Sin asignar' : 'Sin asignar'),
            place: apt.place ?? '',
            comment: apt.comment ?? '',
            status: statusText,
        });

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

    // 8. Ajuste automático de columnas (lo mantengo igual)
    const minWidths: Record<string, number> = {
        date: 12,
        time: 10,
        clientName: 16,
        eventName: 20,
        employeeName: 16,
        place: 16,
        comment: 20,
        status: 16,
    };

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
        const calculated = Math.min(maxLength + 2, 50);
        const minW = minWidths[col.key as string] ?? 10;
        col.width = Math.max(minW, calculated);
    });

    // 9. Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
