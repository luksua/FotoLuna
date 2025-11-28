import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../../../components/Home/Button";
import "../styles/appointmentPhotographer.css";

interface Employee {
    id: number;
    name: string;
    specialty: string;
    portfolioUrl?: string;
    photo?: string;
}

interface Step3Props {
    bookingId: number;
    appointmentDate: string;
    appointmentTime: string;
    packageIdFK: number | null;
    onBack: () => void;
    onNext: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const AppointmentStep3Photographer: React.FC<Step3Props> = ({
    bookingId,
    appointmentDate,
    appointmentTime,
    packageIdFK,
    onBack,
    onNext,
}) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar fotógrafos disponibles
    // useEffect(() => {
    //     const fetchEmployees = async () => {
    //         try {
    //             const token = localStorage.getItem("token");
    //             const res = await axios.get(`${API_BASE}/api/employees/available`, {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             });
    //             setEmployees(res.data);
    //         } catch (err) {
    //             console.error("Error al cargar empleados:", err);
    //             setError("No se pudieron cargar los fotógrafos disponibles.");
    //         }
    //     };

    //     fetchEmployees();
    // }, []);
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(`${API_BASE}/api/employees/available`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        appointmentDate,
                        appointmentTime,
                        packageIdFK,
                    },
                });

                setEmployees(res.data);
            } catch (err) {
                console.error("Error al cargar empleados:", err);
                setError("No se pudieron cargar los fotógrafos disponibles.");
            }
        };

        if (appointmentDate && appointmentTime && packageIdFK) {
            fetchEmployees();
        }
    }, [appointmentDate, appointmentTime, packageIdFK]);



    // Confirmar selección
    const handleContinue = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${API_BASE}/api/bookings/${bookingId}`,
                {
                    employeeIdFK: selectedEmployee,
                    bookingStatus: "Confirmed",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            onNext();
        } catch (err) {
            console.error("Error al asignar fotógrafo:", err);
            setError("No se pudo guardar la selección. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4 appointment-step3 bg-custom-2">
            <h3 className="fw-semibold text-center mb-3">Elige tu fotógrafo</h3>
            <p className="text-muted text-center mb-4">
                Selecciona un fotógrafo para tu sesión o permite que el sistema elija el más adecuado.
            </p>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="photographer-list d-flex flex-column gap-3">
                {employees.map((emp) => (
                    <div
                        key={emp.id}
                        className={`photographer-card d-flex align-items-center justify-content-between p-3 rounded border ${selectedEmployee === emp.id ? "selected" : ""
                            }`}
                        onClick={() => setSelectedEmployee(emp.id)}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <img
                                src={emp.photo ?? "/default-avatar.png"}
                                alt={emp.name}
                                className="rounded-circle"
                                style={{ width: 60, height: 60, objectFit: "cover" }}
                            />
                            <div>
                                <h6 className="fw-semibold">{emp.name}</h6>
                                <small className="text-muted d-block">{emp.specialty}</small>
                                {emp.portfolioUrl && (
                                    <a
                                        href={emp.portfolioUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary text-decoration-none fw-semibold small"
                                    >
                                        Ver portafolio
                                    </a>
                                )}
                            </div>
                        </div>
                        <input
                            className="form-check-input"
                            type="radio"
                            checked={selectedEmployee === emp.id}
                            readOnly
                        />
                    </div>
                ))}

                {/* Opción sin preferencia */}
                <div
                    className={`photographer-card d-flex align-items-center justify-content-between p-3 rounded border ${selectedEmployee === null ? "selected" : ""
                        }`}
                    onClick={() => setSelectedEmployee(null)}
                >
                    <div className="bg-custom-2">
                        <h6 className="fw-semibold">Sin preferencia</h6>
                        <small className="text-muted">
                            Permitir que el sistema asigne automáticamente.
                        </small>
                    </div>
                    <input
                        className="form-check-input"
                        type="radio"
                        checked={selectedEmployee === null}
                        readOnly
                    />
                </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
                <Button value="Atrás" onClick={onBack} />
                <Button
                    value={loading ? "Guardando..." : "Continuar"}
                    onClick={handleContinue}
                />
            </div>
        </div>
    );
};

export default AppointmentStep3Photographer;
