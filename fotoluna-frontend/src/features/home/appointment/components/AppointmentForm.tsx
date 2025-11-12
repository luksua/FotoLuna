/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import AppointmentStep1Validated from "./AppointmentFormStep1";
import AppointmentStep2Packages from "./AppointmentFormStep2";
import AppointmentStep2Documents from "./AppointmentFormStep2Documents"; // ✅ nuevo import
import AppointmentStep3Photographer from "./AppointmentFormStep3";
import StepProgressBar from "./StepProgressBar";

const steps = [
    "Selecciona fecha y hora",
    "Selecciona el paquete",
    "Elige tu fotógrafo",
    "Pago",
    "Confirma tu cita",
    "Finaliza",
];

const AppointmentForm: React.FC = () => {
    const [step, setStep] = useState(1);
    const [appointmentId, setAppointmentId] = useState<number | null>(null);
    const [event, setEvent] = useState<any>(null); // ✅ almacenamos el evento completo (no solo el ID)
    const [bookingId, setBookingId] = useState<number | null>(null);

    // 🔹 Paso 1 -> 2
    const handleNext = (data: { appointmentId: number; event: any }) => {
        setAppointmentId(data.appointmentId);
        setEvent(data.event); // ✅ guardamos todo el evento
        setStep(2);
    };

    // 🔹 Paso 2 -> 3
    const handlePackageConfirm = (data: { bookingId: number }) => {
        setBookingId(data.bookingId);
        setStep(3);
    };

    // 🔹 Paso 3 -> 4
    const handlePhotographerNext = () => {
        setStep(4);
    };

    // 🔹 Paso final (confirmación)
    const handleConfirm = () => {
        alert("🎉 Cita confirmada con éxito!");
        setStep(1);
    };

    // 🔹 Volver atrás
    const handleBack = () => {
        if (step > 1) setStep((prev) => prev - 1);
    };

    return (
        <div className="appointment-wrapper">
            {/* 🔹 Barra de progreso */}
            <div className="progress-bar-wrapper">
                <StepProgressBar currentStep={step} steps={steps} />
            </div>

            {/* 🔹 Contenido dinámico */}
            <div className="step-content">
                {/* Paso 1 */}
                {step === 1 && <AppointmentStep1Validated onNext={handleNext} />}

                {/* Paso 2 — depende del tipo de evento */}
                {step === 2 && appointmentId && event && (
                    event.category === "document_photo" ? (
                        <AppointmentStep2Documents
                            appointmentId={appointmentId}
                            eventId={event.id}
                            onConfirm={handlePackageConfirm}
                            onBack={() => setStep(1)}
                        />
                    ) : (
                        <AppointmentStep2Packages
                            appointmentId={appointmentId}
                            eventId={event.id}
                            onConfirm={handlePackageConfirm}
                            onBack={() => setStep(1)}
                        />
                    )
                )}

                {/* Paso 3 — Asignar fotógrafo */}
                {step === 3 && bookingId && (
                    <AppointmentStep3Photographer
                        bookingId={bookingId}
                        onBack={() => setStep(2)}
                        onNext={handlePhotographerNext}
                    />
                )}

                {/* Paso 4 — Pago */}
                {step === 4 && (
                    <div className="text-center mt-5">
                        <h3>💳 Pago</h3>
                        <div className="d-flex justify-content-center gap-3 mt-4">
                            <button className="btn btn-outline-secondary" onClick={handleBack}>
                                ← Atrás
                            </button>
                            <button className="btn btn-primary" onClick={() => setStep(5)}>
                                Confirmar cita →
                            </button>
                        </div>
                    </div>
                )}

                {/* Paso 5 — Confirmación final */}
                {step === 5 && (
                    <div className="text-center mt-5">
                        <h3>✅ Confirmar cita</h3>
                        <div className="d-flex justify-content-center gap-3 mt-4">
                            <button className="btn btn-outline-secondary" onClick={handleBack}>
                                ← Atrás
                            </button>
                            <button className="btn btn-primary" onClick={handleConfirm}>
                                Finalizar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentForm;
