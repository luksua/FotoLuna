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
    alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
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
    alignment: { vertical: 'middle' as const },
};

type ColumnConfig = { header: string; key: string; width?: number };

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

/**
 * Crea hoja, define columnas, agrega título, fecha y encabezados en la fila 4
 */
function prepareWorksheet(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    reportTitle: string,
    columns: ColumnConfig[]
) {
    const worksheet = workbook.addWorksheet(sheetName);

    // Definir columnas (sin header automático)
    worksheet.columns = columns.map((col) => ({
        key: col.key,
        width: col.width ?? 15,
    }));

    const totalColumns = worksheet.columns.length;
    const lastColumnLetter = worksheet.getColumn(totalColumns).letter; // Ej: H

    // Título (fila 1)
    const titleRow = worksheet.getRow(1);
    worksheet.mergeCells(`A1:${lastColumnLetter}1`);
    titleRow.getCell(1).value = reportTitle;
    titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: COLORS.darkText } };
    titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Fecha de generación (fila 2)
    const now = new Date();
    const generatedAt = now.toLocaleString('es-CO');

    const dateRow = worksheet.getRow(2);
    worksheet.mergeCells(`A2:${lastColumnLetter}2`);
    dateRow.getCell(1).value = `Fecha de generación: ${generatedAt}`;
    dateRow.getCell(1).font = { italic: true, size: 11, color: { argb: COLORS.darkText } };
    dateRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Fila 3 vacía para espacio visual

    // Encabezados (fila 4) – AQUÍ EL CAMBIO
    const headerRowIndex = 4;
    const headerRow = worksheet.getRow(headerRowIndex);

    columns.forEach((col, index) => {
        const cell = headerRow.getCell(index + 1); // A = 1, B = 2, etc.
        cell.value = col.header;
        cell.style = headerStyle;
    });

    return { worksheet, headerRowIndex };
}


// -----------------------------------------------------------------------------
// Citas
// -----------------------------------------------------------------------------
export const exportAppointmentsToExcel = async (appointments: any[], fileName = 'Citas') => {
    const workbook = new ExcelJS.Workbook();

    const columns: ColumnConfig[] = [
        { header: 'ID',        key: 'id',           width: 10 },
        { header: 'Cliente',   key: 'clientName',   width: 20 },
        { header: 'Evento',    key: 'eventName',    width: 18 },
        { header: 'Fecha',     key: 'date',         width: 15 },
        { header: 'Hora',      key: 'time',         width: 12 },
        { header: 'Fotógrafo', key: 'employeeName', width: 20 },
        { header: 'Lugar',     key: 'place',        width: 20 },
        { header: 'Estado',    key: 'status',       width: 15 },
    ];

    const { worksheet } = prepareWorksheet(workbook, 'Citas', 'Reporte de Citas', columns);

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

// -----------------------------------------------------------------------------
// Pagos
// -----------------------------------------------------------------------------
export const exportPaymentsToExcel = async (payments: any[], fileName = 'Pagos') => {
    const workbook = new ExcelJS.Workbook();

    const columns: ColumnConfig[] = [
        { header: 'ID',        key: 'id',        width: 15 },
        { header: 'Cliente',   key: 'customerName', width: 35 },
        { header: 'Monto',     key: 'amount',    width: 22 },
        { header: 'Método',    key: 'method',    width: 22 },
        { header: 'Estado',    key: 'status',    width: 18 },
        { header: 'Fecha',     key: 'date',      width: 18 },
        { header: 'Referencia',key: 'reference', width: 28 },
    ];

    const { worksheet } = prepareWorksheet(workbook, 'Pagos', 'Reporte de Pagos', columns);

    payments.forEach((payment) => {
        const rawId = payment.paymentId ?? payment.id ?? '';
        const idNumber = Number(String(rawId).replace(/[^0-9-]+/g, '')) || 0;

        const parsedAmount =
            typeof payment.amount === 'string'
                ? Number(payment.amount.replace(/[^0-9.-]+/g, ''))
                : Number(payment.amount ?? 0);

        const statusRaw = (payment.paymentStatus ?? payment.status ?? '').toString().toLowerCase();
        const statusMap: Record<string, string> = {
            paid: 'Pagado',
            pending: 'Pendiente',
            cancelled: 'Cancelado',
            unpaid: 'No pagado',
            refunded: 'Reembolsado',
        };
        const statusText = statusMap[statusRaw] ?? (statusRaw ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1) : '');

        const row = worksheet.addRow({
            id: idNumber,
            customerName: payment.customerName ?? payment.clientName ?? '',
            amount: parsedAmount,
            method: payment.paymentMethod ?? payment.method ?? 'Desconocido',
            status: statusText,
            date: payment.paymentDate ?? payment.date ?? '',
            reference: payment.referenceNumber ?? payment.transactionId ?? payment.reference ?? '',
        });

        row.eachCell((cell) => {
            cell.style = cellStyle;
        });
    });

    // Formato moneda en 'amount'
    try {
        const amountColIndex = worksheet.columns.findIndex((c) => c && (c as any).key === 'amount');
        if (amountColIndex >= 0) {
            const col = worksheet.getColumn(amountColIndex + 1);
            col.numFmt = '$#,##0.00';
        }
    } catch (e) {
        // ignore
    }

    // Formato entero en 'id'
    try {
        const idColIndex = worksheet.columns.findIndex((c) => c && (c as any).key === 'id');
        if (idColIndex >= 0) {
            const col = worksheet.getColumn(idColIndex + 1);
            col.numFmt = '0';
        }
    } catch (e) {
        // ignore
    }

    autoAdjustColumns(worksheet);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// -----------------------------------------------------------------------------
// Clientes
// -----------------------------------------------------------------------------
export const exportCustomersToExcel = async (customers: any[], fileName = 'Clientes') => {
    const workbook = new ExcelJS.Workbook();

    const columns: ColumnConfig[] = [
        { header: 'ID',            key: 'id',             width: 10 },
        { header: 'Nombre',        key: 'firstName',      width: 20 },
        { header: 'Apellido',      key: 'lastName',       width: 20 },
        { header: 'Email',         key: 'email',          width: 30 },
        { header: 'Teléfono',      key: 'phone',          width: 18 },
        { header: 'Documento',     key: 'document',       width: 18 },
        { header: 'Fecha Registro',key: 'registeredDate', width: 18 },
    ];

    const { worksheet } = prepareWorksheet(workbook, 'Clientes', 'Reporte de Clientes', columns);

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

// -----------------------------------------------------------------------------
// Empleados
// -----------------------------------------------------------------------------
export const exportEmployeesToExcel = async (employees: any[], fileName = 'Empleados') => {
    const workbook = new ExcelJS.Workbook();

    const columns: ColumnConfig[] = [
        { header: 'ID',        key: 'id',        width: 12 },
        { header: 'Nombre',    key: 'firstName', width: 22 },
        { header: 'Apellido',  key: 'lastName',  width: 22 },
        { header: 'Teléfono',  key: 'phone',     width: 18 },
        { header: 'Documento', key: 'document',  width: 18 },
        { header: 'Correo',    key: 'email',     width: 28 },
        { header: 'Dirección', key: 'address',   width: 28 },
        { header: 'EPS',       key: 'eps',       width: 18 },
        { header: 'Estado',    key: 'status',    width: 12 },
    ];

    const { worksheet } = prepareWorksheet(workbook, 'Empleados', 'Reporte de Empleados', columns);

    employees.forEach((employee) => {
        const numericId =
            typeof employee.id === 'string'
                ? Number(employee.id.replace(/[^0-9-]+/g, '')) || 0
                : Number(employee.id ?? 0);

        const fullName = (employee.nombre || employee.firstName || employee.name || '').toString();
        let firstName = '';
        let lastName = '';
        if (fullName) {
            const parts = fullName.split(' ');
            firstName = parts.shift() || '';
            lastName = parts.join(' ');
        }

        const row = worksheet.addRow({
            id: numericId,
            firstName,
            lastName,
            phone: employee.telefono ?? employee.phone ?? '',
            document: employee.documento ?? employee.document ?? employee.documentNumber ?? '',
            email: employee.correo ?? employee.email ?? '',
            address: employee.address ?? '',
            eps: employee.EPS ?? employee.eps ?? '',
            status:
                employee.estado === true ||
                String(employee.estado).toLowerCase() === 'activo' ||
                String(employee.estado).toLowerCase() === 'active'
                    ? 'Activo'
                    : 'Inactivo',
        });

        row.eachCell((cell) => {
            cell.style = cellStyle;
        });
    });

    // Ajuste automático de columnas con mínimos
    const minWidths: Record<string, number> = {
        id: 8,
        firstName: 12,
        lastName: 12,
        phone: 14,
        document: 12,
        email: 18,
        address: 18,
        eps: 12,
        status: 10,
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

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// -----------------------------------------------------------------------------
// Eventos
// -----------------------------------------------------------------------------
export const exportEventsToExcel = async (events: any[], fileName = 'Eventos') => {
    const workbook = new ExcelJS.Workbook();

    const columns: ColumnConfig[] = [
        { header: 'ID',          key: 'id',         width: 10 },
        { header: 'Tipo',        key: 'type',       width: 20 },
        { header: 'Descripción', key: 'description',width: 30 },
        { header: 'Precio Base', key: 'basePrice',  width: 12 },
    ];

    const { worksheet } = prepareWorksheet(workbook, 'Eventos', 'Reporte de Eventos', columns);

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

// -----------------------------------------------------------------------------
// Genérico
// -----------------------------------------------------------------------------
export const exportGenericDataToExcel = async (
    data: any[],
    sheetName: string,
    columns: ColumnConfig[],
    fileName: string = 'Reporte'
) => {
    const workbook = new ExcelJS.Workbook();

    const { worksheet } = prepareWorksheet(workbook, sheetName, fileName, columns);

    data.forEach((rowData) => {
        const excelRow = worksheet.addRow(rowData);
        excelRow.eachCell((cell) => {
            cell.style = cellStyle;
        });
    });

    autoAdjustColumns(worksheet);
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
