import "../styles/apointment.css"
import Button from "../../../components/Home/Button";

const Apointment = () => {
    return (
        <div className="container py-4">
            <div className="appointment-section">
                <div className="row justify-content-center">

                    {/* Header */}
                    <div className="row text-center appointment">
                        <div className="pt-4 col-lg-12 col-md-12 col-sm-12 bg-custom-2">Mis Citas</div>
                    </div>


                    {/* Mensaje de sesión */}
                    {/* @if (Session::has('mensaje'))
                        <div className="alert alert-success alert-dismissible text-center mb-4" role="alert">
                            {{ Session::get('mensaje') }}
                        </div>
                    @endif */}

                    <div className="row bg-custom-9">

                        {/* Botón crear cita */}
                        <div className="d-flex justify-content-end mb-4">
                            <div className="d-flex justify-content-center">
                                <Button
                                    className="btn btn-perfil w-100"
                                    value="Nueva Cita"
                                    to="/nuevaCita"
                                >
                                    <i className="bi bi-plus-circle"></i> Nueva Cita
                                </Button>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 rounded-3 overflow-hidden ">
                                <thead className="thead-light bg-custom-2 table-secondary">
                                    <tr>
                                        <th>Tipo de Evento</th>
                                        <th>Hora</th>
                                        <th>Fecha</th>
                                        <th>Lugar</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-custom-2">
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>
                                            <Button
                                                value="Cancelar"
                                                className="btn custom2-upload-btn"
                                            />
                                        </td>
                                    </tr>
                                    {/* @forelse ($citas as $cita)
                                        <tr>
                                            <td>{{ $cita->idCita }}</td>
                                            <td>{{ $cita->tipoEvento }}</td>
                                            <td>{{ $cita->horaCita }}</td>
                                            <td>{{ $cita->fechaCita }}</td>
                                            <td>{{ $cita->lugar }}</td>
                                            <td></td>
                                            <td>
                                                <a href="{{ url('/appointment/'.$cita->idCita.'/edit') }}" className="btn custom-upload-btn d-inline"> Editar </a>  |

                                                <form action="{{ url('/appointment/'.$cita->idCita) }}" method="POST" className="d-inline">
                                                    @csrf
                                                    {{ method_field('DELETE') }}
                                                    <input type="submit" onclick="return confirm('¿Deseas eliminar esta cita?')" className="btn custom2-upload-btn" value="Eliminar">
                                                </form>
                                            </td>
                                        </tr>
                                        @empty
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted fst-italic">No hay citas registradas.</td>
                                        </tr>
                                        @endforelse */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Paginación */}
                <div className="d-flex justify-content-center mt-3">
                    {/* {!! $citas->links() !!} */}
                </div>
            </div>
        </div>
    );
};

export default Apointment;
