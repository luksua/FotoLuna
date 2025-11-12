import "../styles/appointment.css";
import Button from "../../../../components/Home/Button";

const Apointment = () => {
    return (
        <div className="container py-4">
            <section className="appointment-section">
                <div className="row justify-content-center">

                    {/* Header */}
                    <div className="col-12">
                        <div className="appointment-header text-center bg-custom-2 py-3 rounded-3 mb-3">
                            <h1 className="h4 m-0">Mis Citas</h1>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="col-12 bg-custom-9 p-3 rounded-3">

                        {/* Botón crear cita */}
                        <div className="d-flex justify-content-end mb-3">
                            <Button
                                className="btn btn-perfil w-100 w-sm-auto"
                                value="Nueva Cita"
                                to="/nuevaCita"
                            >
                                <i className="bi bi-plus-circle" /> Nueva Cita
                            </Button>
                        </div>

                        {/* Tabla / Tarjetas responsive */}
                        <div className="table-responsive-md" role="region" aria-label="Listado de citas">
                            <table className="table table-hover table-sm align-middle mb-0 rounded-3 overflow-hidden appointment-table">
                                <caption className="visually-hidden">Listado de citas</caption>
                                <thead className="thead-light bg-custom-2 table-secondary">
                                    <tr>
                                        <th scope="col">Tipo de Evento</th>
                                        <th scope="col">Hora</th>
                                        <th scope="col">Fecha</th>
                                        <th scope="col" className="d-none d-md-table-cell">Lugar</th>
                                        <th scope="col">Estado</th>
                                        <th scope="col">Acción</th>
                                    </tr>
                                </thead>

                                <tbody className="bg-custom-2">
                                    {/* Fila de ejemplo / placeholder */}
                                    <tr>
                                        <td data-label="Tipo de Evento">—</td>
                                        <td data-label="Hora">—</td>
                                        <td data-label="Fecha">—</td>
                                        <td data-label="Lugar" className="d-none d-md-table-cell">—</td>
                                        <td data-label="Estado">—</td>
                                        <td data-label="Acción">
                                            <Button
                                                value="Cancelar"
                                                className="btn custom2-upload-btn"
                                            />
                                        </td>
                                    </tr>

                                    {/*
                    Aquí colocas tu loop real (React o Blade si renderizas server-side).
                    Asegúrate de añadir data-label a cada <td> para el modo “tarjeta”:
                    <td data-label="Tipo de Evento">{cita.tipoEvento}</td> etc.
                  */}

                                    {/* Si no hay citas */}
                                    {/*
                  <tr>
                    <td colSpan="6" className="text-center text-muted fst-italic">
                      No hay citas registradas.
                    </td>
                  </tr>
                  */}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginación */}
                    <div className="col-12 d-flex justify-content-center mt-3">
                        {/* {!! $citas->links() !!} */}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Apointment;
