import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form, InputGroup, Pagination, Col, Row } from 'react-bootstrap';
import { exportToExcel } from '../../lib/excel-export';
import './DetailsModal.css';
import { isToday, isThisWeek, isThisMonth, isSameDay, isWithinInterval, parseISO } from '../../lib/date-utils';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  columns: { header: string; accessor: string }[];
  fileName: string;
  filterConfig?: FilterConfig;
  dateColumnAccessor?: string; // Nuevo: accessor para la columna de fecha
}

interface FilterConfig {
    column: string;
    header: string;
}

interface SortConfig {
    key: string;
    direction: 'ascending' | 'descending';
}

const ITEMS_PER_PAGE = 10;

const DetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, title, data, columns, fileName, filterConfig, dateColumnAccessor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Nuevos estados para filtros de fecha
  const [dateFilterType, setDateFilterType] = useState<'none' | 'today' | 'this_week' | 'this_month' | 'specific_date' | 'custom_range'>('none');
  const [specificDate, setSpecificDate] = useState<string>(''); // YYYY-MM-DD
  const [customStartDate, setCustomStartDate] = useState<string>(''); // YYYY-MM-DD
  const [customEndDate, setCustomEndDate] = useState<string>(''); // YYYY-MM-DD

  const filterOptions = useMemo(() => {
    if (!filterConfig) return [];
    const uniqueValues = new Set(data.map(item => item[filterConfig.column]));
    return Array.from(uniqueValues);
}, [data, filterConfig]);

  useEffect(() => {
    // Reset pagination and filters when modal is opened/closed or data changes
    setCurrentPage(1);
    setSearchTerm('');
    setFilterValue('');
    setDateFilterType('none');
    setSpecificDate('');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortConfig(null);
  }, [isOpen, data]);


  const sortedAndFilteredData = useMemo(() => {
    let filtered = data;

    // 1. Apply Date Filter
    if (dateColumnAccessor && dateFilterType !== 'none') {
        filtered = filtered.filter(item => {
            const dateString = item[dateColumnAccessor];
            if (!dateString) return false;
            const itemDate = parseISO(dateString); // Using parseISO from date-fns

            if (isNaN(itemDate.getTime())) { // Check for invalid date
                console.warn(`Invalid date string for filtering: ${dateString}`);
                return false;
            }

            const now = new Date();

            switch (dateFilterType) {
                case 'today':
                    return isToday(itemDate);
                case 'this_week':
                    return isThisWeek(itemDate);
                case 'this_month':
                    return isThisMonth(itemDate);
                case 'specific_date':
                    if (!specificDate) return true; // No specific date selected, so don't filter
                    const sDate = parseISO(specificDate);
                    return isSameDay(itemDate, sDate);
                case 'custom_range':
                    if (!customStartDate || !customEndDate) return true; // No range selected, so don't filter
                    const csDate = parseISO(customStartDate);
                    const ceDate = parseISO(customEndDate);
                    // Ensure start date is before end date for valid interval
                    if (csDate.getTime() > ceDate.getTime()) return false;
                    return isWithinInterval(itemDate, csDate, ceDate);
                default:
                    return true;
            }
        });
    }


    // 2. Apply Column Filter (existing logic)
    if (filterValue && filterConfig) {
        filtered = filtered.filter(item => String(item[filterConfig.column]) === filterValue);
    }
    
    // 3. Apply Search Term Filter (existing logic)
    if (searchTerm) {
      filtered = filtered.filter(item =>
        columns.some(col =>
          String(item[col.accessor]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // 4. Apply Sorting (existing logic)
    if (sortConfig !== null) {
        filtered.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }

    return filtered;
  }, [data, searchTerm, columns, filterValue, filterConfig, sortConfig, dateFilterType, specificDate, customStartDate, customEndDate, dateColumnAccessor]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAndFilteredData, currentPage]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDownload = () => {
    const dataToExport = sortedAndFilteredData.map(item => {
      const newRow: { [key: string]: any } = {};
      columns.forEach(col => {
        newRow[col.header] = item[col.accessor];
      });
      return newRow;
    });
    exportToExcel(dataToExport, fileName);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal show={isOpen} onHide={onClose} centered size="xl" dialogClassName="details-modal">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
            <Col md={4}>
                <Form.Control
                    type="text"
                    placeholder="Buscar en todas las columnas..."
                    value={searchTerm}
                    onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                    }}
                />
            </Col>
            {filterConfig && (
            <Col md={3}>
                <Form.Select
                    value={filterValue}
                    onChange={(e) => {
                        setFilterValue(e.target.value);
                        setCurrentPage(1);
                    }}
                    >
                    <option value="">Filtrar por {filterConfig.header}...</option>
                    {filterOptions.map((option, index) => (
                        <option key={index} value={String(option)}>
                            {String(option)}
                        </option>
                    ))}
                </Form.Select>
            </Col>
            )}

            {dateColumnAccessor && (
                <>
                    <Col md={2}>
                        <Form.Select
                            value={dateFilterType}
                            onChange={(e) => {
                                setDateFilterType(e.target.value as any);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="none">Fecha: Sin filtro</option>
                            <option value="today">Fecha: Hoy</option>
                            <option value="this_week">Fecha: Esta Semana</option>
                            <option value="this_month">Fecha: Este Mes</option>
                            <option value="specific_date">Fecha: Específica</option>
                            <option value="custom_range">Fecha: Rango</option>
                        </Form.Select>
                    </Col>
                    {dateFilterType === 'specific_date' && (
                        <Col md={3}>
                            <Form.Control
                                type="date"
                                value={specificDate}
                                onChange={(e) => {
                                    setSpecificDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </Col>
                    )}
                    {dateFilterType === 'custom_range' && (
                        <>
                            <Col md={2}>
                                <Form.Control
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => {
                                        setCustomStartDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </Col>
                            <Col md={2}>
                                <Form.Control
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => {
                                        setCustomEndDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </Col>
                        </>
                    )}
                </>
            )}
        </Row>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.accessor} onClick={() => requestSort(col.accessor)} className="sortable-header">
                    {col.header}
                    {sortConfig && sortConfig.key === col.accessor && (
                      sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽'
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={index}>
                    {columns.map((col) => (
                      <td key={col.accessor}>{item[col.accessor] ?? 'N/A'}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center">No hay datos para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <Pagination className="justify-content-center">
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
            {[...Array(totalPages).keys()].map(page => (
              <Pagination.Item
                key={page + 1}
                active={page + 1 === currentPage}
                onClick={() => setCurrentPage(page + 1)}
              >
                {page + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        )}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleDownload} disabled={sortedAndFilteredData.length === 0}>
          <i className="bi bi-download me-2"></i>Descargar Excel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetailsModal;