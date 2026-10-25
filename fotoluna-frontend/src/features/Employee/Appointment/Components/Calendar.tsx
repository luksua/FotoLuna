import React, { useMemo, useCallback } from "react";
import type { Cita } from "../Components/Types/types";

type Direction = "prev" | "next";

interface CalendarProps {
    currentMonth: Date;
    selectedDate: Date | null;
    citas: Cita[];
    onChangeMonth: (direction: Direction) => void;
    onDayClick: (date: Date) => void;
    onDotClick: (cita: Cita) => void;
}

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Genera los días que se muestran en el calendario (6 semanas = 42 días)
const getCalendarDays = (month: Date): Date[] => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstOfMonth = new Date(year, m, 1);
    const lastOfMonth = new Date(year, m + 1, 0);

    const firstWeekDay = (firstOfMonth.getDay() + 6) % 7; // semana inicia lunes

    const days: Date[] = [];

    // Días anteriores del mes
    for (let i = 0; i < firstWeekDay; i++) {
        const d = new Date(firstOfMonth);
        d.setDate(d.getDate() - (firstWeekDay - i));
        days.push(d);
    }

    // Días del mes
    for (let d = 1; d <= lastOfMonth.getDate(); d++) {
        days.push(new Date(year, m, d));
    }

    // Completar 42 días
    while (days.length < 42) {
        const last = days[days.length - 1];
        const next = new Date(last);
        next.setDate(last.getDate() + 1);
        days.push(next);
    }

    return days;
};

const Calendar: React.FC<CalendarProps> = React.memo(({
    currentMonth,
    selectedDate,
    citas,
    onChangeMonth,
    onDayClick,
    onDotClick,
}) => {
    const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

    const getCitasDelDia = useCallback((date: Date): Cita[] => {
        return citas.filter(
            (c) =>
                c.date.getFullYear() === date.getFullYear() &&
                c.date.getMonth() === date.getMonth() &&
                c.date.getDate() === date.getDate()
        );
    }, [citas]);

    // Mes formateado con primera letra mayúscula
    const formattedMonth = useMemo(() => {
        const str = currentMonth.toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
        });
        return str.charAt(0).toUpperCase() + str.slice(1);
    }, [currentMonth]);

    const today = new Date();

    return (
        <div className="custom-calendar fl-calendar-wrapper">
            {/* Header del Calendario */}
            <div className="calendar-header-modern">
                <div className="calendar-title-wrap">
                    <div className="calendar-icon-box">
                        <i className="bi bi-calendar3"></i>
                    </div>
                    <div>
                        <h4 className="calendar-month-name">{formattedMonth}</h4>
                    </div>
                </div>

                <div className="calendar-controls">
                    <button
                        type="button"
                        className="calendar-nav-btn"
                        onClick={() => onChangeMonth("prev")}
                        title="Mes anterior"
                        aria-label="Mes anterior"
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                    <button
                        type="button"
                        className="calendar-today-btn"
                        onClick={() => onDayClick(new Date())}
                        title="Ir a Hoy"
                    >
                        Hoy
                    </button>
                    <button
                        type="button"
                        className="calendar-nav-btn"
                        onClick={() => onChangeMonth("next")}
                        title="Mes siguiente"
                        aria-label="Mes siguiente"
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>

            {/* Encabezados de semana */}
            <div className="calendar-weekdays-modern">
                {WEEK_DAYS.map((day) => (
                    <div key={day} className="calendar-weekday-modern">
                        {day}
                    </div>
                ))}
            </div>

            {/* Días */}
            <div className="calendar-grid-modern">
                {calendarDays.map((date, index) => {
                    const citasDelDia = getCitasDelDia(date);

                    const isSelected =
                        selectedDate &&
                        date.getFullYear() === selectedDate.getFullYear() &&
                        date.getMonth() === selectedDate.getMonth() &&
                        date.getDate() === selectedDate.getDate();

                    const isCurrentMonth =
                        date.getMonth() === currentMonth.getMonth();

                    const isToday =
                        date.getFullYear() === today.getFullYear() &&
                        date.getMonth() === today.getMonth() &&
                        date.getDate() === today.getDate();

                    return (
                        <div
                            key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${index}`}
                            className={`day-cell 
                                ${isSelected ? "selected" : ""} 
                                ${!isCurrentMonth ? "other-month" : ""}
                                ${isToday ? "today" : ""}
                                ${citasDelDia.length > 0 ? "has-appointments" : ""}`}
                            onClick={() => onDayClick(date)}
                        >
                            <div className="day-header">
                                <span className="day-number-label">{date.getDate()}</span>
                                {isToday && <span className="today-badge">Hoy</span>}
                                {citasDelDia.length > 0 && (
                                    <span className="day-count-badge" title={`${citasDelDia.length} citas`}>
                                        {citasDelDia.length}
                                    </span>
                                )}
                            </div>

                            {/* Indicadores de citas */}
                            <div className="appointment-indicators">
                                {citasDelDia.length <= 2 ? (
                                    citasDelDia.map((cita) => {
                                        const statusClass = cita.status.toLowerCase();
                                        return (
                                            <div
                                                key={cita.appointmentId}
                                                className={`appointment-indicator-pill ${statusClass}`}
                                                title={`${cita.client || "Cliente"} (${cita.startTime}) - ${cita.status}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDotClick(cita);
                                                }}
                                            >
                                                <span className="indicator-time">{cita.startTime}</span>
                                                <span className="indicator-client">{cita.client}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <>
                                        <div
                                            key={citasDelDia[0].appointmentId}
                                            className={`appointment-indicator-pill ${citasDelDia[0].status.toLowerCase()}`}
                                            title={`${citasDelDia[0].client || "Cliente"} (${citasDelDia[0].startTime}) - ${citasDelDia[0].status}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDotClick(citasDelDia[0]);
                                            }}
                                        >
                                            <span className="indicator-time">{citasDelDia[0].startTime}</span>
                                            <span className="indicator-client">{citasDelDia[0].client}</span>
                                        </div>
                                        <div
                                            className="indicator-more-badge"
                                            title={`${citasDelDia.length - 1} citas adicionales para este día. Haz clic para verlas en el panel.`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDayClick(date);
                                            }}
                                        >
                                            <span className="dots-cluster">
                                                {citasDelDia.slice(1, 4).map((c, i) => (
                                                    <span
                                                        key={`${c.appointmentId}-${i}`}
                                                        className={`mini-status-dot ${c.status.toLowerCase()}`}
                                                    />
                                                ))}
                                            </span>
                                            <span className="more-count">+{citasDelDia.length - 1} más</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Leyenda de Estados */}
            <div className="calendar-legend">
                <div className="legend-item">
                    <span className="legend-dot pendiente"></span>
                    <span className="legend-text">Pendiente</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot confirmada"></span>
                    <span className="legend-text">Confirmada</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot completada"></span>
                    <span className="legend-text">Completada</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot cancelada"></span>
                    <span className="legend-text">Cancelada</span>
                </div>
            </div>
        </div>
    );
});

export default Calendar;
