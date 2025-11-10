
import React, { useState, useRef } from "react";
import EmployeeLayout from "../../../layouts/HomeEmployeeLayout";
import "../../auth/styles/uplo.css";

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
        // Aquí puedes manejar el envío del formulario
        console.log({
            file,
            event,
            time,
            date,
            location,
            linkedUsers
        });
        alert("Archivo subido exitosamente!");
        
        // Reset form
        setFile(null);
        setEvent("");
        setTime("");
        setDate("");
        setLocation("");
        setLinkedUsers([]);
    };

    const handleCancel = () => {
        setFile(null);
        setEvent("");
        setTime("");
        setDate("");
        setLocation("");
        setLinkedUsers([]);
    };

    return (
        <EmployeeLayout>
            <div className="upload-container">
                <div className="upload-box">
                <h3 className="bg-custom-3">Subir Archivo</h3>
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
                                ACEPTAR
                            </button>
                            <button 
                                className="reject-btn"
                                onClick={handleCancel}
                                type="button"
                            >
                                RECHAZAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default Upload;