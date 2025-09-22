import { useState } from "react";
import InputLabel from "./InputLabel";
import Button from "./Button";


const SignUpForm = () => {
    const []

    return (
        <div className="form-section" >
            <div className="row text-center">
                <div className="col-lg-12 col-md-12 col-sm-12 bg-custom-2">
                    Registro
                </div>
            </div>
            <div className="row bg-custom-9">
                <div className="col-lg-6 col-md-6 col-sm-12 d-flex flex-column align-items-center">
                    <img src="{{ asset('image/imagenperfil.jpg') }}" alt="Foto Perfil" id="profilePreview" className="profile-img mb-3"/>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12">
                    <form id="formRegistro" onSubmit={}>
                        <div className="row mb-3 align-items-center">
                            <div className="col-12 col-md-4 texto2">
                                <label className="col-form-label">Nombres:</label>
                            </div>
                            <div className="col-12 col-md-8">
                                <input type="text" className="form-control @error('nombreCliente') is-invalid @enderror" id=""
                                    name="nombreCliente" value="{{ old('nombreCliente') }}" required>
                                @error('nombreCliente')
                                    <span className="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                                @enderror
                            </div>
                        </div>
                        <InputLabel
                            id="nombreCliente"
                            label="Nombres:"
                            type="text"
                            value={}
                            onChange={}
                            required
                        />
                        <div className="row mb-3 align-items-center">
                            <div className="col-12 col-md-4 texto2">
                                <label className="col-form-label">Apellidos:</label>
                            </div>
                            <div className="col-12 col-md-8">
                                <input type="text" className="form-control @error('apellidoCliente') is-invalid @enderror" id="apellidoCliente"
                                    name="apellidoCliente" value="{{ old('apellidoCliente') }}" required>
                                @error('apellidoCliente')
                                    <span className="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                                @enderror
                            </div>
                        </div>
                        <div className="row mb-3 align-items-center">
                            <div className="col-12 col-md-4 texto2">
                                <label for="telefonoCliente" className="col-form-label">Teléfono:</label>
                            </div>
                            <div className="col-12 col-md-8">
                                <input type="text" className="form-control @error('telefonoCliente') is-invalid @enderror" id="telefonoCliente"
                                    name="telefonoCliente" value="{{ old('telefonoCliente') }}" required>
                                @error('telefonoCliente')
                                    <span className="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                                @enderror
                            </div>
                        </div>
                        <div className="row mb-3 align-items-center">
                            <div className="col-12 col-md-4 texto2">
                                <label for="tipoDocumento" className="col-form-label">Tipo de Documento:</label>
                            </div>
                            <div className="col-12 col-md-8">
                                <select className="form-select @error('tipoDocCliente') is-invalid @enderror" id="tipoDocumento"
                                    name="tipoDocCliente" required>
                                    <option value="">...</option>
                                    <option value="CC" {{ old('tipoDocumento') == 1 ? 'selected' : '' }}>Cédula</option>
                                    <option value="CE" {{ old('tipoDocumento') == 2 ? 'selected' : '' }}>Cédula de Extranjería
                                    </option>
                                    <option value="PAS" {{ old('tipoDocumento') == 3 ? 'selected' : '' }}>Pasaporte</option>
                                </select>
                                @error('tipoDocCliente')
                                    <span className="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                                @enderror
                            </div>
                        </div>
                        <div className="row mb-3 align-items-center">
                            <div className="col-12 col-md-4 texto2">
                                <label for="documento" className="col-form-label">Número de Documento:</label>
                            </div>
                            <div className="col-12 col-md-8">
                                <input type="text" className="form-control @error('numeroDocCliente') is-invalid @enderror" id="documento"
                                    name="numeroDocCliente" value="{{ old('numeroDocCliente') }}" required>
                                @error('numeroDocCliente')
                                    <span className="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                                @enderror
                            </div>
                        </div>
                        <div className="row mb-3 align-items-center">
                            <div className="col-12 col-md-4 texto2">
                                <label for="correo" className="col-form-label">Correo:</label>
                            </div>
                            <div className="col-12 col-md-8">
                                <input type="email" className="form-control @error('correoCliente') is-invalid @enderror" id="correo"
                                    name="correoCliente" value="{{ old('correoCliente') }}" required>
                                @error('correoCliente')
                                    <span className="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                                @enderror
                            </div>
                        </div>
                        <div className="row mb-3 align-items-center">
                            <div className="col-12 col-md-4 texto2">
                                <label for="password" className="col-form-label">Contraseña:</label>
                            </div>
                            <div className="col-12 col-md-8">
                                <input type="password" className="form-control @error('password') is-invalid @enderror"
                                    id="password" name="password" required>
                                @error('password')
                                    <span className="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                                @enderror
                            </div>
                        </div>
                        <div className="row mb-1 align-items-center">
                            <div className="col-12 col-md-4 texto2">
                                <label for="password_confirmation" className="col-form-label">Confirmar Contraseña:</label>
                            </div>
                            <div className="col-12 col-md-8">
                                <input type="password" className="form-control" id="password_confirmation" name="password_confirmation" required>
                            </div>
                        </div>
                        <div id="emailHelp" className="form-text mb-4 text-end">La contraseña debe tener mínimo 8 caracteres</div>
                        <input type="file" id="profileImage" name="fotoCliente" required>
                        <div className="d-flex justify-content-center">
                            <Button
                                value="Crear Cuenta"
                            />
                        </div>
                    </form>
                </div >
            </div >
        </div >
    );
};

export default SignUpForm;