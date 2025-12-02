// components/Upload/Upload.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeLayout from "../../../../layouts/HomeEmployeeLayout";
import { useAuth } from "../../../../context/useAuth"; // Importar useAuth
import "../Styles/uplo.css";

// Tipos para mayor claridad
type TCustomer = {
    id: number;
    fullName: string;
};

type TLinkedCustomer = {
    id: number;
    name: string;
};


// ⚠ Ajusta este valor si tu backend no está en localhost:8000
const API_BASE_URL = "http://localhost:8000/api";
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
    const { user } = useAuth(); // Obtener el usuario autenticado

    // Estado para la lista de eventos que vendrán de la API
    const [eventsList, setEventsList] = useState<any[]>(
        []
    );


    const [files, setFiles] = useState<File[]>([]);
    const [event, setEvent] = useState("");
    const [time, setTime] = useState(formatTimeInput(now));   // hora actual
    const [date, setDate] = useState(formatDateInput(now));   // fecha actual
    const [location, setLocation] = useState("");
    
    // --- Estados para la búsqueda de clientes ---
    const [linkedUsers, setLinkedUsers] = useState<TLinkedCustomer[]>([]);
    const [searchUser, setSearchUser] = useState("");
    const [allClients, setAllClients] = useState<TCustomer[]>([]);
    const [filteredClients, setFilteredClients] = useState<TCustomer[]>([]);
    
    const [dragActive, setDragActive] = useState(false);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [statusType, setStatusType] = useState<"success" | "error" | "">("");
    const [statusMessage, setStatusMessage] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // --- Cargar eventos desde la API al montar el componente ---
    useEffect(() => {
        const fetchEvents = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No se encontró el token para obtener los eventos.");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/events`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setEventsList(data); 
                } else {
                    console.error("Error al obtener la lista de eventos.");
                }
            } catch (error) {
                console.error("Error de conexión al obtener los eventos:", error);
            }
        };

        fetchEvents();
    }, []);

    // --- Cargar todos los clientes al montar ---
    useEffect(() => {
        const fetchAllClients = async () => {
            const token = localStorage.getItem("token");
            if (!token || !user) return;

            try {
                const response = await fetch(`${API_BASE_URL}/customers?employee_id=${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("API Response for clients:", JSON.stringify(data, null, 2));
                    const clients = data.data || data || [];
                    setAllClients(clients);
                    setFilteredClients(clients.filter(
                        (customer: TCustomer) => !linkedUsers.some(linked => linked.id === customer.id)
                    ));
                } else {
                    console.error("Error al obtener la lista completa de clientes.");
                }
            } catch (error) {
                console.error("Error de conexión al obtener clientes:", error);
            }
        };

        fetchAllClients();
    }, [user, linkedUsers]); // Recargar si el usuario cambia o si se vincula uno nuevo

    // --- Filtrar clientes en el frontend ---
    useEffect(() => {
        let filtered = allClients;

        if (searchUser.trim() !== '') {
            filtered = allClients.filter(client =>
                client.fullName
                    .toLowerCase()
                    .includes(searchUser.toLowerCase())
            );
        }

        const availableClients = filtered.filter(
            (customer: TCustomer) => !linkedUsers.some(linked => linked.id === customer.id)
        );

        setFilteredClients(availableClients);
    }, [searchUser, allClients, linkedUsers]);


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

    const handleSelectUser = (customer: TCustomer) => {
        // Añadir el cliente seleccionado a la lista de vinculados
        setLinkedUsers((prev) => [...prev, { id: customer.id, name: customer.fullName }]);
        // Limpiar el input para resetear el filtro
        setSearchUser("");
    };

    const handleRemoveUser = (userIdToRemove: number) => {
        setLinkedUsers((prev) => prev.filter((user) => user.id !== userIdToRemove));
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

    const handleSubmit = async (e: React.FormEvent) => {
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

        if (files.length > 100) {
            const msg = `No puedes subir más de 100 fotos a la vez (intentaste subir ${files.length}).`;
            setErrors((prev) => ({
                ...prev,
                files: msg,
            }));
            setStatusType("error");
            setStatusMessage("No se pudieron subir las fotos debido al límite de 100.");
            return;
        }

        
        try {
            const token = localStorage.getItem("token");

            if (!token || !user) { // También chequear que el usuario esté cargado
                setStatusType("error");
                setStatusMessage("No se encontró la sesión del empleado. Por favor, inicia sesión de nuevo.");
                return; 
            }

            const formData = new FormData();

            files.forEach((file) => {
                formData.append("photos[]", file);
            });

            formData.append("event_name", event.trim());
            formData.append("date", date);
            formData.append("time", time);
            formData.append("location", location.trim());
            formData.append("employee_id", String(user.id)); // Enviar el ID del empleado

            // Enviar los IDs de los clientes vinculados
            const linkedUserIds = linkedUsers.map(u => u.id);
            formData.append("linked_users", JSON.stringify(linkedUserIds));

            // Manejar customerIdFK y bookingIdFK (si es necesario)
            // Si el primer cliente vinculado es el principal, podrías hacer esto:
            if (linkedUserIds.length > 0) {
                 formData.append("customerIdFK", String(linkedUserIds[0]));
            } else {
                 formData.append("customerIdFK", ""); // O manejar como el backend espere
            }
            formData.append("bookingIdFK", "");   // bookingIdFK es nullable

            setStatusType("");
            setStatusMessage("");

            const response = await fetch(
                `${API_BASE_URL}/employee/cloud-photos`,
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Error al subir las fotos:", errorData);
                
                if (response.status === 422 && errorData.errors) {
                    const validationErrorMsg = Object.values(errorData.errors).flat().join(' ');
                    setStatusMessage(`Error de validación: ${validationErrorMsg}`);
                } else {
                    setStatusMessage(errorData.message || "Error al subir las fotos al servidor.");
                }

                setStatusType("error");
                return;
            }

            const data = await response.json();
            console.log("Respuesta del servidor:", data);

            setStatusType("success");
            setStatusMessage(
                files.length === 1
                    ? "La foto se subió correctamente a la nube."
                    : `Las ${files.length} fotos se subieron correctamente a la nube.`
            );

            setFiles([]);
            setLinkedUsers([]);

            setTimeout(() => {
                navigate("/employee/admin");
            }, 1200);
        } catch (err) {
            console.error(err);
            setStatusType("error");
            setStatusMessage(
                "Ocurrió un error de conexión. Por favor, intenta nuevamente."
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
                        <h3 className="upload-title">Subir Fotos</h3>
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
                                        {files.length}{" "}
                                        {files.length > 1
                                            ? "archivos seleccionados"
                                            : "archivo seleccionado"}
                                    </h4>
                                    <ul>
                                        {files.slice(0, 3).map((f, idx) => (
                                            <li key={idx}>{f.name}</li>
                                        ))}
                                        {files.length > 3 && (
                                            <li>y {files.length - 3} más...</li>
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
                                    Cambiar
                                </button>
                            </div>
                        ) : (
                            <div className="upload-content">
                                <i className="bi bi-cloud-arrow-up upload-icon"></i>
                                <span>Arrastra y suelta las fotos aquí</span>
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
                                <select
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
                                >
                                    <option value="" disabled>
                                        -- Selecciona el tipo de evento --
                                    </option>
                                    {eventsList.map((evt) => (
                                        <option key={evt.id} value={evt.eventType}>
                                            {evt.eventType}
                                        </option>
                                    ))}
                                </select>
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

                        {/* Vincular clientes */}
                        <div className="upload-link">
                            <label>Vincular clientes:</label>
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Buscar cliente por nombre o email..."
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>

                            {/* --- Resultados de la búsqueda --- */}
                            {filteredClients.length > 0 && (
                                <ul className="search-results">
                                    {filteredClients.map((customer) => (
                                        <li
                                            key={customer.id}
                                            onClick={() => handleSelectUser(customer)}
                                        >
                                            {customer.fullName}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            
                            {/* --- Clientes Vinculados --- */}
                            {linkedUsers.length > 0 && (
                                <div className="linked-users">
                                    {linkedUsers.map((linked) => (
                                        <div
                                            key={linked.id}
                                            className="user-tag"
                                        >
                                            <span>{linked.name}</span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveUser(linked.id)
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
                                Subir Fotos
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
