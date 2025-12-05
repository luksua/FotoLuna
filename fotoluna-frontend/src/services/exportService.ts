import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Colores personalizados de FotoLuna (ARGB)
const COLORS = {
    primaryPurple: 'FF805fa6',
    lightPurple: 'FFd297e0',
    darkText: 'FF000000',
    white: 'FFFFFFFF',
    headerBg: 'FF805fa6',
};

// Estilos reutilizables
const headerStyle = {
    font: { bold: true, color: { argb: COLORS.white }, size: 12 },
    fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: COLORS.headerBg } },
    alignment: { horizontal: 'center' as const, vertical: 'center' as const },
    border: {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const },
    },
};

const cellStyle = {
    border: {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const },
    },
    alignment: { vertical: 'center' as const },
};

function autoAdjustColumns(worksheet: ExcelJS.Worksheet) {
    worksheet.columns.forEach((col) => {
        let maxLength = 0;
        col?.eachCell?.({ includeEmpty: true }, (cell) => {
            const cellLength = cell.value?.toString().length || 0;
            if (cellLength > maxLength) maxLength = cellLength;
        });
        col.width = Math.min(maxLength + 2, 50);
    });
}

export const exportAppointmentsToExcel = async (appointments: any[], fileName = 'Citas') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Citas');

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Cliente', key: 'clientName', width: 20 },
        { header: 'Evento', key: 'eventName', width: 18 },
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Hora', key: 'time', width: 12 },
        { header: 'Fotógrafo', key: 'employeeName', width: 20 },
        { header: 'Lugar', key: 'place', width: 20 },
        { header: 'Estado', key: 'status', width: 15 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
        cell.style = headerStyle;
    });

    appointments.forEach((apt) => {
        const row = worksheet.addRow({
            id: Number(apt.appointmentId ?? apt.id ?? ''),
            clientName: apt.clientName ?? '',
            eventName: apt.eventName ?? '',
            date: apt.date ?? apt.appointmentDate ?? '',
            time: apt.time ?? apt.appointmentTime ?? '',
            employeeName: apt.employeeName ?? '',
            place: apt.place ?? '',
            status: apt.status ?? apt.appointmentStatus ?? '',
        });

        row.eachCell((cell) => {
            cell.style = cellStyle;
        });
    });

    autoAdjustColumns(worksheet);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportPaymentsToExcel = async (payments: any[], fileName = 'Pagos') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pagos');

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 12 },
        { header: 'Cliente', key: 'customerName', width: 30 },
        { header: 'Monto', key: 'amount', width: 16 },
        { header: 'Método', key: 'method', width: 18 },
        { header: 'Estado', key: 'status', width: 14 },
        { header: 'Fecha', key: 'date', width: 16 },
        { header: 'Referencia', key: 'reference', width: 24 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
        cell.style = headerStyle;
    });

    payments.forEach((payment) => {
        const parsedAmount = typeof payment.amount === 'string'
            ? Number(payment.amount.replace(/[^0-9.-]+/g, ''))
            : Number(payment.amount ?? 0);

        const row = worksheet.addRow({
            id: Number(payment.paymentId ?? payment.id ?? ''),
            customerName: payment.customerName ?? payment.clientName ?? '',
            amount: parsedAmount,
            method: payment.paymentMethod ?? payment.method ?? 'Desconocido',
            status: payment.paymentStatus ?? payment.status ?? '',
            date: payment.paymentDate ?? payment.date ?? '',
            reference: payment.referenceNumber ?? payment.transactionId ?? payment.reference ?? '',
        });

        row.eachCell((cell) => {
            cell.style = cellStyle;
        });
    });

    // Aplicar formato de moneda solo a la columna 'amount'
    try {
        const amountColIndex = worksheet.columns.findIndex((c) => c && (c as any).key === 'amount');
        if (amountColIndex >= 0) {
            const col = worksheet.getColumn(amountColIndex + 1);
            col.numFmt = '"$"#,##0.00';
        }
    } catch (e) {
        // no interrumpir si hay fallo
    }

    autoAdjustColumns(worksheet);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportCustomersToExcel = async (customers: any[], fileName = 'Clientes') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Clientes');

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'firstName', width: 20 },
        { header: 'Apellido', key: 'lastName', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Teléfono', key: 'phone', width: 18 },
        { header: 'Documento', key: 'document', width: 18 },
        { header: 'Fecha Registro', key: 'registeredDate', width: 18 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
        cell.style = headerStyle;
    });

    customers.forEach((customer) => {
        const row = worksheet.addRow({
            id: Number(customer.customerId ?? customer.id ?? ''),
            firstName: customer.firstNameCustomer ?? customer.firstName ?? '',
            lastName: customer.lastNameCustomer ?? customer.lastName ?? '',
            email: customer.emailCustomer ?? customer.email ?? '',
            phone: customer.phoneCustomer ?? customer.phone ?? '',
            document: customer.documentNumber ?? customer.document ?? '',
            registeredDate: customer.createdAt ?? customer.registeredDate ?? '',
        });

        row.eachCell((cell) => {
            cell.style = cellStyle;
        });
    });

    autoAdjustColumns(worksheet);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportEmployeesToExcel = async (employees: any[], fileName = 'Empleados') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Empleados');

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'firstName', width: 20 },
        { header: 'Apellido', key: 'lastName', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Teléfono', key: 'phone', width: 18 },
        { header: 'Especialidad', key: 'specialty', width: 20 },
        { header: 'Disponible', key: 'available', width: 12 },
        { header: 'Calificación', key: 'rating', width: 12 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
        cell.style = headerStyle;
    });

    employees.forEach((employee) => {
        const row = worksheet.addRow({
            id: Number(employee.employeeId ?? employee.id ?? ''),
            firstName: employee.firstNameEmployee ?? employee.firstName ?? '',
            lastName: employee.lastNameEmployee ?? employee.lastName ?? '',
            email: employee.emailEmployee ?? employee.email ?? '',
            phone: employee.phoneEmployee ?? employee.phone ?? '',
            specialty: employee.specialty ?? 'N/A',
            available: employee.available ? 'Sí' : 'No',
            rating: employee.averageRating ?? employee.rating ?? 'N/A',
        });

        row.eachCell((cell) => {
            cell.style = cellStyle;
        });
    });

    autoAdjustColumns(worksheet);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportEventsToExcel = async (events: any[], fileName = 'Eventos') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Eventos');

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Tipo', key: 'type', width: 20 },
        { header: 'Descripción', key: 'description', width: 30 },
        { header: 'Precio Base', key: 'basePrice', width: 12 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
        cell.style = headerStyle;
    });

    events.forEach((ev) => {
        const row = worksheet.addRow({
            id: Number(ev.eventId ?? ev.id ?? ''),
            type: ev.eventType ?? ev.type ?? '',
            description: ev.eventDescription ?? ev.description ?? '',
            basePrice: ev.basePrice ?? ev.price ?? '',
        });
        row.eachCell((cell) => {
            cell.style = cellStyle;
        });
    });

    autoAdjustColumns(worksheet);
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportGenericDataToExcel = async (
    data: any[],
    sheetName: string,
    columns: { header: string; key: string; width?: number }[],
    fileName: string = 'Reporte'
) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width || 15,
    }));

    worksheet.getRow(1).eachCell((cell) => {
        cell.style = headerStyle;
    });

    data.forEach((row) => {
        const excelRow = worksheet.addRow(row);
        excelRow.eachCell((cell) => {
            cell.style = cellStyle;
        });
    });

    autoAdjustColumns(worksheet);
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
