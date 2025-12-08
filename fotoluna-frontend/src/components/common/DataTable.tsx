import React from 'react';

interface DataTableProps {
    headers: string[];
    data: (string | number | undefined)[][];
}

export const DataTable: React.FC<DataTableProps> = ({ headers, data }) => {
    return (
        <div className="table-responsive">
            <table className="table table-striped table-hover">
                <thead className="thead-dark">
                    <tr>
                        {headers.map((header, index) => (
                            <th scope="col" key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
