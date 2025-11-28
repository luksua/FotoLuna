// components/Upload/Upload.tsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import "../Styles/uplo.css";
import type { Photo, EventInfo } from "../../PhotoAdmin/Components/types/Photo";

/* Helpers para formatear fecha y hora para <input type="date/time"> */
const formatDateInput = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const formatTimeInput = (date: Date): string => {
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${min}`;
};

const Upload: React.FC = () => {
    const now = new Date();

    const [files, setFiles] = useState<File[]>([]);
    const [event, setEvent] = useState("");
    const [time, setTime] = useState(formatTimeInput(now));   // hora actual
    const [date, setDate] = useState(formatDateInput(now));   // fecha actual
    const [location, setLocation] = useState("");
    const [linkedUsers, setLinkedUsers] = useState<string[]>([]);
    const [searchUser, setSearchUser] = useState("");
    const [dragActive, setDragActive] = useState(false);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [statusType, setStatusType] = useState<"success" | "error" | "">("");
    const [statusMessage, setStatusMessage] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    /* -------- Drag & Drop -------- */

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

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            setFiles(droppedFiles);
            setErrors((prev) => ({ ...prev, files: "" }));
            setStatusType("");
            setStatusMessage("");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(selectedFiles);
            setErrors((prev) => ({ ...prev, files: "" }));
            setStatusType("");
            setStatusMessage("");
        }
    };

    /* -------- Vincular usuarios -------- */

    const handleAddUser = () => {
        const value = searchUser.trim();
        if (value && !linkedUsers.includes(value)) {
            setLinkedUsers((prev) => [...prev, value]);
            setSearchUser("");
        }
    };

    const handleRemoveUser = (userToRemove: string) => {
        setLinkedUsers((prev) => prev.filter((user) => user !== userToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddUser();
        }
    };

    /* -------- Validaciones -------- */

    const validate = (): { [key: string]: string } => {
        const newErrors: { [key: string]: string } = {};

        if (files.length === 0) {
            newErrors.files = "Selecciona al menos una foto.";
        }
        if (!event.trim()) {
            newErrors.event = "El nombre del evento es obligatorio.";
        }
        if (!date) {
            newErrors.date = "La fecha es obligatoria.";
        }
        if (!time) {
            newErrors.time = "La hora es obligatoria.";
        }
        if (!location.trim()) {
            newErrors.location = "La ubicación es obligatoria.";
        }

        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setStatusType("");
        setStatusMessage("");

        const baseErrors = validate();
        if (Object.keys(baseErrors).length > 0) {
            setErrors(baseErrors);
            setStatusType("error");
            setStatusMessage("Revisa los campos marcados en rojo.");
            return;
        }

        try {
            const existingPhotos: Photo[] = JSON.parse(
                localStorage.getItem("uploadedPhotos") || "[]"
            );

            if (existingPhotos.length + files.length > 100) {
                const msg = `No puedes tener más de 100 fotos. Actualmente tienes ${existingPhotos.length} y estás intentando subir ${files.length}.`;
                setErrors((prev) => ({
                    ...prev,
                    files: msg,
                }));
                setStatusType("error");
                setStatusMessage("No se pudieron subir las fotos por el límite de 100.");
                return;
            }

            const eventInfo: EventInfo = {
                name: event.trim(),
                date,
                time,
                location: location.trim(),
                linkedUsers,
            };

            const nowIso = new Date().toISOString();

            const newPhotos: Photo[] = files.map((file, index) => ({
                id: Date.now() + index,
                name: file.name,
                path: URL.createObjectURL(file),
                size: file.size,
                uploaded_at: nowIso,
                event: eventInfo,
            }));

            const updatedPhotos = [...newPhotos, ...existingPhotos];
            localStorage.setItem("uploadedPhotos", JSON.stringify(updatedPhotos));

            window.dispatchEvent(new Event("storage"));

            // Mensaje de éxito -> luego redirigimos a admin
            setStatusType("success");
            setStatusMessage(
                files.length === 1
                    ? "La foto se subió correctamente."
                    : `Las ${files.length} fotos se subieron correctamente.`
            );

            // Opcional: limpiar formulario
            setFiles([]);
            // dejamos fecha/hora actuales
            // setEvent(""); setLocation(""); setLinkedUsers([]);

            // Redirigir después de un pequeño tiempo para que se alcance a ver el mensaje
            setTimeout(() => {
                navigate("/employee/admin");
            }, 1200);
        } catch (err) {
            console.error(err);
            setStatusType("error");
            setStatusMessage(
                "Ocurrió un error al guardar las fotos. Intenta nuevamente."
            );
        }
    };

    const handleCancel = () => {
        navigate("/employee/admin");
    };

    /* -------- Render -------- */

    return (
        <EmployeeLayout>
            <div className="upload-container">
                <div className="upload-box">
                    <div className="upload-header">
                        <h3 className="upload-title">Subir Archivo</h3>
                    </div>
                    <hr />

                    {/* Área de subida */}
                    <div
                        className={`upload-dropzone ${dragActive ? "drag-active" : ""
                            } ${files.length > 0 ? "has-file" : ""}`}
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
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />

                        {files.length > 0 ? (
                            <div className="file-preview-multiple">
                                <i className="bi bi-images file-icon"></i>
                                <div className="file-info">
                                    <h4>
                                        {files.length} archivo
                                        {files.length > 1 && "s"} seleccionado
                                        {files.length > 1 && "s"}
                                    </h4>
                                    <ul>
                                        {files.slice(0, 3).map((f, idx) => (
                                            <li key={idx}>{f.name}</li>
                                        ))}
                                        {files.length > 3 && (
                                            <li>+ {files.length - 3} más…</li>
                                        )}
                                    </ul>
                                </div>
                                <button
                                    type="button"
                                    className="change-file-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFiles([]);
                                    }}
                                >
                                    <i className="bi bi-arrow-repeat"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="upload-content">
                                <i className="bi bi-cloud-arrow-up upload-icon"></i>
                                <span>Arrastra y suelta tus archivos aquí</span>
                                <span className="upload-subtext">
                                    o haz clic para seleccionar
                                </span>
                                <span className="upload-subtext-extra">
                                    Puedes seleccionar varias fotos a la vez
                                </span>
                            </div>
                        )}
                    </div>
                    {errors.files && (
                        <p className="upload-error-text">{errors.files}</p>
                    )}

                    {/* Formulario de información */}
                    <form className="upload-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Evento</label>
                                <input
                                    type="text"
                                    value={event}
                                    onChange={(e) => {
                                        setEvent(e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            event: "",
                                        }));
                                        setStatusType("");
                                        setStatusMessage("");
                                    }}
                                    placeholder="Nombre del evento"
                                />
                                {errors.event && (
                                    <p className="upload-error-text">
                                        {errors.event}
                                    </p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Hora</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => {
                                        setTime(e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            time: "",
                                        }));
                                        setStatusType("");
                                        setStatusMessage("");
                                    }}
                                />
                                {errors.time && (
                                    <p className="upload-error-text">
                                        {errors.time}
                                    </p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => {
                                        setDate(e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            date: "",
                                        }));
                                        setStatusType("");
                                        setStatusMessage("");
                                    }}
                                />
                                {errors.date && (
                                    <p className="upload-error-text">
                                        {errors.date}
                                    </p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Lugar</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => {
                                        setLocation(e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            location: "",
                                        }));
                                        setStatusType("");
                                        setStatusMessage("");
                                    }}
                                    placeholder="Ubicación del evento"
                                />
                                {errors.location && (
                                    <p className="upload-error-text">
                                        {errors.location}
                                    </p>
                                )}
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
                                    onChange={(e) =>
                                        setSearchUser(e.target.value)
                                    }
                                    onKeyDown={handleKeyPress}
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
                                        <div
                                            key={index}
                                            className="user-tag"
                                        >
                                            <span>{user}</span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveUser(user)
                                                }
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mensaje de estado global */}
                        {statusType && statusMessage && (
                            <div
                                className={`upload-alert ${statusType === "success"
                                        ? "upload-alert-success"
                                        : "upload-alert-error"
                                    }`}
                            >
                                <i
                                    className={
                                        statusType === "success"
                                            ? "bi bi-check-circle"
                                            : "bi bi-exclamation-triangle"
                                    }
                                />
                                <span>{statusMessage}</span>
                            </div>
                        )}

                        {/* Botones */}
                        <div className="upload-actions">
                            <button className="accept-btn" type="submit">
                                <i className="bi bi-cloud-arrow-up me-2"></i>
                                Subir archivos
                            </button>
                            <button
                                className="reject-btn"
                                type="button"
                                onClick={handleCancel}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default Upload;
