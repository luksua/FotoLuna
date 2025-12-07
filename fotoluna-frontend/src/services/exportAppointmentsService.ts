import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportAppointmentsToExcel = async (appointments: any[], fileName = 'Citas') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Citas');

    worksheet.columns = [
        { header: 'Fecha', key: 'date', width: 14 },
        { header: 'Hora', key: 'time', width: 10 },
        { header: 'Cliente', key: 'clientName', width: 22 },
        { header: 'Evento', key: 'eventName', width: 24 },
        { header: 'Fotógrafo', key: 'employeeName', width: 22 },
        { header: 'Lugar', key: 'place', width: 22 },
        { header: 'Comentario', key: 'comment', width: 28 },
        { header: 'Estado', key: 'status', width: 22 },
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

    const statusMap: Record<string, string> = {
        'pending_assignment': 'Pendiente asignación',
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

    appointments.forEach((apt) => {
        const statusRaw = (apt.status ?? '').toString().toLowerCase().trim();
        const statusText = statusMap[statusRaw] || statusMap[statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)] || statusRaw;
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
            cell.alignment = { vertical: 'center', wrapText: true };
        });
    });

    // Ajuste automático de columnas
    const minWidths: Record<string, number> = { date: 12, time: 10, clientName: 16, eventName: 20, employeeName: 16, place: 16, comment: 20, status: 16 };
    worksheet.columns.forEach((col: any) => {
        let maxLength = 0;
        col.eachCell?.({ includeEmpty: true }, (cell: any) => {
            const text = (cell.text !== undefined && cell.text !== null) ? String(cell.text) : (cell.value !== undefined && cell.value !== null ? String(cell.value) : '');
            const len = text.replace(/\r?\n/g, ' ').length;
            if (len > maxLength) maxLength = len;
        });
        const calculated = Math.min(maxLength + 2, 50);
        const minW = minWidths[col.key as string] ?? 10;
        col.width = Math.max(minW, calculated);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
