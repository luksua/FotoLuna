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

// Genera los días que se muestran en el calendario (6 semanas)
const getCalendarDays = (month: Date): Date[] => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstOfMonth = new Date(year, m, 1);
    const lastOfMonth = new Date(year, m + 1, 0);

    // Semana empezando en lunes
    const firstWeekDay = (firstOfMonth.getDay() + 6) % 7;

    const days: Date[] = [];

    // Días del mes anterior
    for (let i = 0; i < firstWeekDay; i++) {
        const d = new Date(firstOfMonth);
        d.setDate(d.getDate() - (firstWeekDay - i));
        days.push(d);
    }

    // Días del mes actual
    for (let d = 1; d <= lastOfMonth.getDate(); d++) {
        days.push(new Date(year, m, d));
    }

    // Días del siguiente mes hasta completar 42 celdas
    const totalCells = 42;
    while (days.length < totalCells) {
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
                c.date.getDate() === date.getDate() &&
                c.date.getMonth() === date.getMonth() &&
                c.date.getFullYear() === date.getFullYear()
        );

    return (
        <div className="custom-calendar">
            {/* Header */}
            <div className="calendar-header">
                <button
                    className="btn"
                    onClick={() => onChangeMonth("prev")}
                >
                    ‹
                </button>
                <h4>
                    {currentMonth.toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                    })}
                </h4>
                <button
                    className="btn"
                    onClick={() => onChangeMonth("next")}
                >
                    ›
                </button>
            </div>

            {/* Días de la semana */}
            <div className="calendar-weekdays">
                {WEEK_DAYS.map((day) => (
                    <div key={day} className="calendar-weekday">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="calendar-grid">
                {calendarDays.map((date, index) => {
                    const citasDelDia = getCitasDelDia(date);
                    const isSelected =
                        selectedDate &&
                        date.getDate() === selectedDate.getDate() &&
                        date.getMonth() === selectedDate.getMonth() &&
                        date.getFullYear() === selectedDate.getFullYear();

                    const isCurrentMonth =
                        date.getMonth() === currentMonth.getMonth();

                    const today = new Date();
                    const isToday =
                        date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear();

                    return (
                        <div
                            key={`${date.toISOString()}-${index}`}
                            className={`day-column ${isSelected ? "selected" : ""
                                } ${!isCurrentMonth ? "other-month" : ""} ${isToday ? "today" : ""
                                }`}
                            onClick={() => onDayClick(date)}
                        >
                            <div className="day-number">{date.getDate()}</div>

                            {/* Puntos por cita (color según estado) */}
                            <div className="appointment-dots">
                                {citasDelDia.map((cita) => (
                                    <div
                                        key={cita.id}
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
