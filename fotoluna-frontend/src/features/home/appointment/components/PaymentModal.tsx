import React from "react";

interface Props {
    show: boolean;
    message: string;
    onClose: () => void;
}

const PaymentErrorModal: React.FC<Props> = ({ show, message, onClose }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3 className="modal-title">Error en el pago</h3>
                <p className="modal-message">{message}</p>

                <button className="modal-close-btn" onClick={onClose}>
                    Cerrar
                </button>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .modal-box {
          background: #fff;
          padding: 25px;
          border-radius: 12px;
          width: 90%;
          max-width: 380px;
          text-align: center;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-title {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: #d9534f;
        }
        .modal-message {
          font-size: 1rem;
          margin-bottom: 20px;
        }
        .modal-close-btn {
          background: #d9534f;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          cursor: pointer;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
};

export default PaymentErrorModal;
