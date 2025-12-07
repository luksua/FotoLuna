/* eslint-disable @typescript-eslint/no-explicit-any */
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
    documentTypeId: number | null;
    onBack: () => void;
    onNext: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const STEP3_DRAFT_KEY = "appointmentStep3Photographer";

const AppointmentStep3Photographer: React.FC<Step3Props> = ({
    bookingId,
    appointmentDate,
    appointmentTime,
    packageIdFK,
    documentTypeId,
    onBack,
    onNext,
}) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1) Cargar selección desde localStorage (solo una vez)
    useEffect(() => {
        const raw = localStorage.getItem(STEP3_DRAFT_KEY);
        if (!raw) return;

        try {
            const parsed = JSON.parse(raw) as {
                selectedEmployeeId: number | string | null;
            };

            if (parsed.selectedEmployeeId !== null && parsed.selectedEmployeeId !== undefined) {
                const n = Number(parsed.selectedEmployeeId);
                if (!Number.isNaN(n)) {
                    setSelectedEmployee(n);
                }
            }
        } catch (e) {
            console.warn("Error leyendo borrador Step3:", e);
        }
    }, []);

    // 2) Guardar selección en localStorage cuando cambie
    useEffect(() => {
        const payload = {
            selectedEmployeeId: selectedEmployee,
        };
        localStorage.setItem(STEP3_DRAFT_KEY, JSON.stringify(payload));
    }, [selectedEmployee]);

    // 3) Cargar fotógrafos disponibles
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem("token");

                const params: any = {
                    appointmentDate,
                    appointmentTime,
                };

                if (packageIdFK) {
                    params.packageIdFK = packageIdFK;
                } else if (documentTypeId) {
                    params.documentTypeId = documentTypeId;
                }

                const res = await axios.get(`${API_BASE}/api/employees/available`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params,
                });

                // Normalizamos ids a number
                const list: Employee[] = (res.data ?? []).map((emp: any) => ({
                    ...emp,
                    id: Number(emp.id),
                }));

                setEmployees(list);

                // Si el id guardado ya no existe en la lista, limpiamos selección
                if (
                    selectedEmployee !== null &&
                    !list.some((e) => e.id === selectedEmployee)
                ) {
                    setSelectedEmployee(null);
                }
            } catch (err) {
                console.error("Error al cargar empleados:", err);
                setError("No se pudieron cargar los fotógrafos disponibles.");
            }
        };

        if (
            appointmentDate &&
            appointmentTime &&
            (packageIdFK || documentTypeId)
        ) {
            fetchEmployees();
        }
    }, [appointmentDate, appointmentTime, packageIdFK, documentTypeId, selectedEmployee]);

    // Confirmar selección
    const handleContinue = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${API_BASE}/api/bookings/${bookingId}`,
                {
                    employeeIdFK: selectedEmployee, // puede ser null (sin preferencia)
                    // bookingStatus: "Confirmed", // 👈 ya no tocamos el status aquí
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
                        className={`photographer-card d-flex align-items-center justify-content-between p-3 rounded border ${
                            Number(selectedEmployee) === Number(emp.id) ? "selected" : ""
                        }`}
                        onClick={() => setSelectedEmployee(Number(emp.id))}
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
                            checked={Number(selectedEmployee) === Number(emp.id)}
                            readOnly
                        />
                    </div>
                ))}

                {/* Opción sin preferencia */}
                <div
                    className={`photographer-card d-flex align-items-center justify-content-between p-3 rounded border ${
                        selectedEmployee === null ? "selected" : ""
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
