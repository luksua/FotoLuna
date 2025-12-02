import React from 'react';
import '../Styles/Spinner.css';

const Spinner: React.FC = () => {
    return (
        <div className="spinner-overlay">
            <div className="spinner"></div>
        </div>
    );
};

export default Spinner;
