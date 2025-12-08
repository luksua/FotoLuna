import * as XLSX from 'xlsx';

// Define un tipo genérico para los datos, esperando un array de objetos.
type Data = Record<string, any>[];

/**
 * Exporta un array de objetos a un archivo Excel (XLSX).
 * @param data - El array de datos a exportar.
 * @param fileName - El nombre del archivo (sin la extensión .xlsx).
 */
export const exportToExcel = (data: Data, fileName: string): void => {
  if (!data || data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  // Crea una nueva hoja de trabajo a partir del array de datos JSON.
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Crea un nuevo libro de trabajo.
  const workbook = XLSX.utils.book_new();

  // Añade la hoja de trabajo al libro, con el nombre 'Datos'.
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Genera el archivo .xlsx y dispara la descarga en el navegador.
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
