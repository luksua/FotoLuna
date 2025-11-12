import { useState } from "react";
import SelectLabel from "../../../../components/Home/Select";
import { useForm, Controller } from "react-hook-form";
import '../styles/notifications.css';

type Notification = {
    id: number;
    title: string;
    message: string;
    read: boolean;
};

const mockNotifications: Notification[] = [
    { id: 1, title: "Nueva cita agendada", message: "Tienes una cita el 20 de octubre a las 3:00pm.", read: false },
    { id: 2, title: "Archivo subido", message: "El archivo 'evento.jpg' fue subido correctamente.", read: false },
    { id: 3, title: "Cliente confirmado", message: "El cliente Juan Pérez confirmó su asistencia.", read: true },
];


const Notification = () => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [selected, setSelected] = useState<Notification | null>(null);

    const handleOpen = (notif: Notification) => {
        setSelected(notif);
        setNotifications(notifications.map(n =>
            n.id === notif.id ? { ...n, read: true } : n
        ));
    };

    const handleClose = () => setSelected(null);

    const { control} = useForm();

    const eventOptions = [
        { value: "Más recientes", label: "Más recientes" },
        { value: "cumple", label: "Cumpleaños" },
        { value: "graduacion", label: "Graduación" },
    ];

    return (
        <div className="container-sign">
            <div className="form-section">
                <div className="row bg-custom-9">
                    <div className="col-lg-10 col-md-9 col-sm-9 py-5 ">
                        <h2 className="mb-4 text-center bg-custom-2">Notificaciones</h2>
                    </div>
                    <div className="col-lg-2 col-md-3 col-sm-2 py-5">
                        <Controller
                                name="event"
                                control={control}
                                render={({ field }) => (
                                    <SelectLabel
                                        id="order"
                                        option="Ordenar"
                                        value={field.value}
                                        label=""
                                        options={eventOptions}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                    </div>
                </div>
                <div className="">
                    <ul className="notifications-list">
                        {notifications.map(notif => (
                            <li
                                key={notif.id}
                                className={`notification-item ${notif.read ? "read" : "unread"}`}
                                onClick={() => handleOpen(notif)}
                            >
                                <b>{notif.title}</b>
                                <span className="notification-status">
                                    {notif.read ? <i className="bi bi-bell"></i> : <i className="bi bi-bell-fill"></i>}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Modal para ver el mensaje */}
                    {selected && (
                        <div className="notification-modal">
                            <div className="modal-content">
                                <h3>{selected.title}</h3>
                                <p>{selected.message}</p>
                                <button 
                                    className="close-button"
                                    onClick={handleClose}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default Notification;