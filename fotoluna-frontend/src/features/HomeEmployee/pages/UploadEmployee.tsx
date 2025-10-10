import EmployeeLayout from "../../../layouts/HomeEmployeeLayout";
import "../../auth/styles/UploadEmployee.css";

const EmployeeUpload = () => {
    return (
        <EmployeeLayout>
            <div className="upload-container">
                <h2 className="upload-title">Nube &gt; Subir</h2>
                <div className="upload-box">
                    <label htmlFor="file-upload" className="upload-dropzone">
                        <span>Elegir archivo</span>
                        <i className="bi bi-cloud-arrow-up"></i>
                        <input id="file-upload" type="file" style={{ display: "none" }} />
                    </label>
                    <div className="upload-tags">
                        <div>
                            <label>Evento:</label>
                            <input type="text" />
                        </div>
                        <div>
                            <label>Hora:</label>
                            <input type="time" />
                        </div>
                        <div>
                            <label>Fecha:</label>
                            <input type="date" />
                        </div>
                        <div>
                            <label>Lugar:</label>
                            <input type="text" />
                        </div>
                    </div>
                    <div className="upload-link">
                        <label>Vincular a:</label>
                        <input type="text" placeholder="Buscar usuarios" />
                        <button className="upload-search-btn">
                            <i className="bi bi-search"></i>
                        </button>
                    </div>
                    <div className="upload-actions">
                        <button className="accept-btn">ACEPTAR</button>
                        <button className="reject-btn">RECHAZAR</button>
                    </div>
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default EmployeeUpload;