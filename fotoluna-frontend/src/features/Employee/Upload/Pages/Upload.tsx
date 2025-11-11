import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import "../Styles/uplo.css";
import type { Photo, EventInfo } from "../../PhotoAdmin/Components/types/Photo";

const Upload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [event, setEvent] = useState("");
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const [linkedUsers, setLinkedUsers] = useState<string[]>([]);
    const [searchUser, setSearchUser] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAddUser = () => {
        if (searchUser.trim() && !linkedUsers.includes(searchUser.trim())) {
            setLinkedUsers([...linkedUsers, searchUser.trim()]);
            setSearchUser('');
        }
    };

    const handleRemoveUser = (userToRemove: string) => {
        setLinkedUsers(linkedUsers.filter(user => user !== userToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddUser();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            alert("Por favor, selecciona un archivo primero");
            return;
        }

        // Crear información del evento
        const eventInfo: EventInfo = {
            name: event,
            date: date,
            time: time,
            location: location,
            linkedUsers: linkedUsers
        };

        // Crear nuevo objeto Photo
        const newPhoto: Photo = {
            id: Date.now(),
            name: file.name,
            path: URL.createObjectURL(file),
            size: file.size,
            uploaded_at: new Date().toISOString(),
            event: eventInfo
        };

        // Obtener fotos existentes de localStorage
        const existingPhotos = JSON.parse(localStorage.getItem('uploadedPhotos') || '[]');

        // Verificar límite de 100 fotos
        if (existingPhotos.length >= 100) {
            alert("No puedes tener más de 100 fotos. Elimina algunas antes de subir nuevas.");
            return;
        }

        // Agregar nueva foto al inicio
        const updatedPhotos = [newPhoto, ...existingPhotos];

        // Guardar en localStorage
        localStorage.setItem('uploadedPhotos', JSON.stringify(updatedPhotos));

        // Disparar evento personalizado para notificar el cambio
        window.dispatchEvent(new Event('storage'));

        alert("Archivo subido exitosamente!");

        // Redirigir al administrador de fotos
        navigate('/employee/admin'); // Ajusta la ruta según tu configuración
    };

    const handleCancel = () => {
        // Redirigir al administrador de fotos sin guardar
        navigate('/employee/admin');
    };

    const handleGoToAdmin = () => {
        navigate('/employee/admin');
    };

    return (
        <EmployeeLayout>
            <div className="upload-container">
                <div className="upload-box">
                    <div className="upload-header"> 
                        <h3 className="upload-title">Subir Archivo</h3>
                    </div>
                    <hr />

                    {/* Área de subida de archivos */}
                    <div
                        className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            id="file-upload"
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />

                        {file ? (
                            <div className="file-preview">
                                <i className="bi bi-file-earmark-text file-icon"></i>
                                <div className="file-info">
                                    <h4>{file.name}</h4>
                                    <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button
                                    type="button"
                                    className="change-file-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                >
                                    <i className="bi bi-arrow-repeat"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="upload-content">
                                <i className="bi bi-cloud-arrow-up upload-icon"></i>
                                <span>Arrastra y suelta tu archivo aquí</span>
                                <span className="upload-subtext">o haz clic para seleccionar</span>
                            </div>
                        )}
                    </div>

                    {/* Formulario de información */}
                    <div className="upload-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Evento</label>
                                <input
                                    type="text"
                                    value={event}
                                    onChange={(e) => setEvent(e.target.value)}
                                    placeholder="Nombre del evento"
                                />
                            </div>
                            <div className="form-group">
                                <label>Hora</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Lugar</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Ubicación del evento"
                                />
                            </div>
                        </div>

                        {/* Vincular usuarios */}
                        <div className="upload-link">
                            <label>Vincular a:</label>
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Buscar usuarios"
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <button
                                    className="upload-search-btn"
                                    onClick={handleAddUser}
                                    type="button"
                                >
                                    <i className="bi bi-plus-lg"></i>
                                </button>
                            </div>

                            {linkedUsers.length > 0 && (
                                <div className="linked-users">
                                    {linkedUsers.map((user, index) => (
                                        <div key={index} className="user-tag">
                                            <span>{user}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveUser(user)}
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="upload-actions">
                            <button
                                className="accept-btn"
                                onClick={handleSubmit}
                            >
                                <i className="bi bi-cloud-arrow-up me-2"></i>
                                SUBIR ARCHIVO
                            </button>
                            <button
                                className="reject-btn"
                                onClick={handleCancel}
                                type="button"
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                CANCELAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default Upload;