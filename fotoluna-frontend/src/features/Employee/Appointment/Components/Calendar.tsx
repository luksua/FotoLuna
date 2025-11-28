import React from "react";
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

const WEEK_DAYS = ["LUN", "MAR", "MIE", "JUE", "VIE", "SÁB", "DOM"];

// Genera los días que se muestran en el calendario
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

const Calendar: React.FC<CalendarProps> = ({
    currentMonth,
    selectedDate,
    citas,
    onChangeMonth,
    onDayClick,
    onDotClick,
}) => {
    const calendarDays = getCalendarDays(currentMonth);

    const getCitasDelDia = (date: Date): Cita[] =>
        citas.filter(
            (c) =>
                c.date.getFullYear() === date.getFullYear() &&
                c.date.getMonth() === date.getMonth() &&
                c.date.getDate() === date.getDate()
        );

    return (
        <div className="custom-calendar">
            {/* Header */}
            <div className="calendar-header">
                <button className="btn" onClick={() => onChangeMonth("prev")}>
                    ‹
                </button>

                <h4>
                    {currentMonth.toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                    })}
                </h4>

                <button className="btn" onClick={() => onChangeMonth("next")}>
                    ›
                </button>
            </div>

            {/* Encabezados de semana */}
            <div className="calendar-weekdays">
                {WEEK_DAYS.map((day) => (
                    <div key={day} className="calendar-weekday">
                        {day}
                    </div>
                ))}
            </div>

            {/* Días */}
            <div className="calendar-grid">
                {calendarDays.map((date, index) => {
                    const citasDelDia = getCitasDelDia(date);

                    const isSelected =
                        selectedDate &&
                        date.getFullYear() === selectedDate.getFullYear() &&
                        date.getMonth() === selectedDate.getMonth() &&
                        date.getDate() === selectedDate.getDate();

                    const isCurrentMonth =
                        date.getMonth() === currentMonth.getMonth();

                    const today = new Date();
                    const isToday =
                        date.getFullYear() === today.getFullYear() &&
                        date.getMonth() === today.getMonth() &&
                        date.getDate() === today.getDate();

                    return (
                        <div
                            key={`${date.toISOString()}-${index}`}
                            className={`day-column 
                                ${isSelected ? "selected" : ""} 
                                ${!isCurrentMonth ? "other-month" : ""}
                                ${isToday ? "today" : ""}`}
                            onClick={() => onDayClick(date)}
                        >
                            <div className="day-number">{date.getDate()}</div>

                            {/* Bolitas */}
                            <div className="appointment-dots">
                                {citasDelDia.map((cita) => (
                                    <div
                                        key={cita.appointmentId}
                                        className={`appointment-dot ${cita.status.toLowerCase()}`}
                                        title={`${cita.client} - ${cita.startTime}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDotClick(cita);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
