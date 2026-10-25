/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Cropper } from "react-cropper";
import type { ReactCropperElement } from "react-cropper";
import "../../../../styles/cropper.css";
import InputLabel from "../../../../components/Home/InputLabel";
import Button from "../../../../components/Home/Button";
import "../../../home/auth/styles/signUp.css";
import axios from "axios";
import { useAuth } from "../../../../context/useAuth";

type FormValues = {
	firstNameCustomer: string;
	lastNameCustomer: string;
	phoneCustomer: string;
	documentType: string;
	documentNumber: string;
	emailCustomer: string;
	password: string;
	confirmPassword: string;
	photoCustomer?: FileList;
};

interface AddCustomerFormProps {
	onSuccess: () => void;
	onCancel?: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({
	onSuccess,
	onCancel,
}) => {
	const { user } = useAuth();
	const [profileImage, setProfileImage] = useState("/img/imagenperfil.jpg");
	const [cropData, setCropData] = useState("");
	const cropperRef = useRef<ReactCropperElement>(null);
	const [showModal, setShowModal] = useState(false);
	const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
	const [loading, setLoading] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<FormValues>({
		defaultValues: {
			firstNameCustomer: "",
			lastNameCustomer: "",
			phoneCustomer: "",
			documentType: "CC",
			documentNumber: "",
			emailCustomer: "",
			password: "",
			confirmPassword: "",
		},
	});

	// convierte dataURL (cropData) a File
	function dataURLtoFile(dataurl: string, filename = "photo.jpg") {
		const arr = dataurl.split(",");
		const mimeMatch = arr[0].match(/:(.*?);/);
		const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
		const bstr = atob(arr[1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, { type: mime });
	}

	const onSubmit: SubmitHandler<FormValues> = async (data) => {
		if (!user) {
			setServerErrors({
				general: ["No se pudo identificar al empleado. Por favor, inicie sesión de nuevo."],
			});
			return;
		}

		setServerErrors({});
		setLoading(true);

		try {
			const formData = new FormData();
			formData.append("role", "cliente");
			formData.append("firstNameCustomer", data.firstNameCustomer);
			formData.append("lastNameCustomer", data.lastNameCustomer);
			formData.append("phoneCustomer", data.phoneCustomer || "");
			formData.append("documentType", data.documentType || "CC");
			formData.append("documentNumber", data.documentNumber || "");
			formData.append("email", data.emailCustomer);
			formData.append("password", data.password);
            const creatorId = user && user.id ? String(user.id) : '';

			formData.append("password_confirmation", data.confirmPassword);

            formData.append("employee_id", creatorId);




			// Foto recortada
			if (cropData && cropData.startsWith("data:")) {
				const file = dataURLtoFile(cropData, "photo.jpg");
				formData.append("photoCustomer", file);
			}

			const token = localStorage.getItem("token");
			const headers: any = {
				Accept: "application/json",
			};
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

            console.log("Enviando formulario con datos:");
            for (const pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }

			await axios.post(`${API_BASE || ""}/api/register`, formData, {
				headers,
			});

			// No cambiamos token ni navegamos:
			// solo avisamos al padre para que cierre modal y recargue la lista
			onSuccess();
		} catch (err: any) {
			if (err.response) {
				if (err.response.status === 422) {
					setServerErrors(err.response.data.errors || {});
				} else {
					setServerErrors({
						general: [err.response.data.message || "Error del servidor"],
					});
				}
			} else {
				setServerErrors({
					general: ["No se pudo conectar con el servidor"],
				});
			}
		} finally {
			setLoading(false);
		}
	};

	const handleImageChange = (files: FileList | null) => {
		if (files && files[0]) {
			const file = files[0];
			const imageUrl = URL.createObjectURL(file);
			setProfileImage(imageUrl);
		}
	};

	const getCropData = () => {
		if (typeof cropperRef.current?.cropper !== "undefined") {
			setCropData(
				cropperRef.current?.cropper.getCroppedCanvas().toDataURL("image/jpeg")
			);
		}
	};

	const serverErrorFor = (field: string) => {
		return serverErrors[field] ? serverErrors[field].join(" ") : undefined;
	};

	return (
		<div className="add-customer-form-wrapper">
			<form onSubmit={handleSubmit(onSubmit)}>
				{/* Sección de Foto de Perfil */}
				<div className="d-flex flex-column align-items-center mb-4 text-center">
					<div className="position-relative profile-upload-circle">
						<img
							src={cropData ? cropData : profileImage}
							alt="Foto Perfil"
							className="rounded-circle shadow-sm"
							style={{
								width: "100px",
								height: "100px",
								objectFit: "cover",
								border: "3px solid #f3e8ff",
								outline: "2px solid #c792df",
							}}
						/>
						<label
							htmlFor="profileImage-employee"
							className="btn btn-sm position-absolute bottom-0 end-0 rounded-circle shadow"
							onClick={() => setShowModal(true)}
							style={{
								backgroundColor: "#9d4edd",
								color: "#ffffff",
								width: "32px",
								height: "32px",
								padding: "0",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
							}}
							title="Cambiar foto"
						>
							<i className="bi bi-camera-fill" style={{ fontSize: "0.85rem" }}></i>
						</label>
						<input
							type="file"
							id="profileImage-employee"
							className="form-control"
							onChange={(e) => handleImageChange(e.target.files)}
							accept="image/*"
							hidden
						/>
					</div>
					<small className="text-muted mt-2" style={{ fontSize: "0.8rem" }}>
						Foto de perfil del cliente (opcional)
					</small>

					{/* Modal de recorte */}
					{showModal && (
						<>
							<div className="modal fade show" style={{ display: "block", zIndex: 1060 }}>
								<div className="modal-dialog modal-dialog-centered">
									<div className="modal-content rounded-4 border-0 shadow-lg">
										<div className="modal-header border-0 pb-0">
											<h5 className="modal-title fw-bold">Recortar Imagen</h5>
											<button
												type="button"
												className="btn-close"
												onClick={() => setShowModal(false)}
											></button>
										</div>
										<div className="modal-body">
											<Cropper
												src={profileImage}
												style={{ height: 280, width: "100%" }}
												initialAspectRatio={1}
												aspectRatio={1}
												guides={true}
												cropBoxResizable={false}
												viewMode={1}
												ref={cropperRef}
												minCropBoxHeight={10}
												minCropBoxWidth={10}
												background={false}
												responsive={true}
												checkOrientation={false}
											/>
										</div>
										<div className="modal-footer border-0 pt-0">
											<button
												type="button"
												className="btn btn-light rounded-pill px-3"
												onClick={() => setShowModal(false)}
											>
												Cancelar
											</button>
											<button
												type="button"
												className="btn btn-primary rounded-pill px-4"
												style={{
													background: "linear-gradient(135deg, #c792df 0%, #9d4edd 100%)",
													border: "none",
												}}
												onClick={() => {
													getCropData();
													setShowModal(false);
												}}
											>
												Aplicar Recorte
											</button>
										</div>
									</div>
								</div>
							</div>
							<div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
						</>
					)}
				</div>

				{/* Grid de campos en 2 columnas */}
				<div className="row g-3">
					{/* Nombres */}
					<div className="col-md-6">
						<Controller
							name="firstNameCustomer"
							control={control}
							rules={{ required: "El nombre es obligatorio" }}
							render={({ field }) => (
								<InputLabel
									id="firstNameEmployeeCustomer"
									label="Nombres:"
									type="text"
									value={field.value || ""}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={
										errors.firstNameCustomer?.message ||
										serverErrorFor("firstNameCustomer")
									}
								/>
							)}
						/>
					</div>

					{/* Apellidos */}
					<div className="col-md-6">
						<Controller
							name="lastNameCustomer"
							control={control}
							rules={{ required: "El apellido es obligatorio" }}
							render={({ field }) => (
								<InputLabel
									id="lastNameEmployeeCustomer"
									label="Apellidos:"
									type="text"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={
										errors.lastNameCustomer?.message ||
										serverErrorFor("lastNameCustomer")
									}
								/>
							)}
						/>
					</div>

					{/* Teléfono */}
					<div className="col-md-6">
						<Controller
							name="phoneCustomer"
							control={control}
							rules={{
								required: "El número de teléfono es obligatorio",
								pattern: {
									value: /^[0-9]+$/,
									message: "Solo se permiten números",
								},
							}}
							render={({ field }) => (
								<InputLabel
									id="phoneEmployeeCustomer"
									label="Teléfono:"
									type="number"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={
										errors.phoneCustomer?.message ||
										serverErrorFor("phoneCustomer")
									}
								/>
							)}
						/>
					</div>

					{/* Tipo de documento */}
					<div className="col-md-6">
						<Controller
							name="documentType"
							control={control}
							rules={{ required: "Seleccione el tipo de documento" }}
							render={({ field }) => (
								<div className="mb-3">
									<label htmlFor="documentTypeEmployee" className="form-label" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#4a3b61" }}>
										Tipo de Documento:
									</label>
									<select
										id="documentTypeEmployee"
										className={`form-select ${
											errors.documentType || serverErrorFor("documentType")
												? "is-invalid"
												: ""
										}`}
										style={{ borderRadius: "12px", border: "1px solid #e2e8f0", padding: "10px 14px", backgroundColor: "#fdfbfe" }}
										value={field.value}
										onChange={(e) => field.onChange(e.target.value)}
										onBlur={field.onBlur}
										ref={field.ref}
									>
										<option value="CC">Cédula de ciudadanía (CC)</option>
										<option value="CE">Cédula de extranjería (CE)</option>
										<option value="PAS">Pasaporte (PAS)</option>
									</select>
									<div className="invalid-feedback">
										{errors.documentType?.message ||
											serverErrorFor("documentType")}
									</div>
								</div>
							)}
						/>
					</div>

					{/* Número de documento */}
					<div className="col-md-6">
						<Controller
							name="documentNumber"
							control={control}
							rules={{ required: "El número es obligatorio" }}
							render={({ field }) => (
								<InputLabel
									id="documentNumberEmployeeCustomer"
									label="Número de Documento:"
									type="number"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={
										errors.documentNumber?.message ||
										serverErrorFor("documentNumber")
									}
								/>
							)}
						/>
					</div>

					{/* Correo */}
					<div className="col-md-6">
						<Controller
							name="emailCustomer"
							control={control}
							rules={{ required: "El email es obligatorio" }}
							render={({ field }) => (
								<InputLabel
									id="emailCustomerEmployee"
									label="Correo Electrónico:"
									type="email"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={
										errors.emailCustomer?.message || serverErrorFor("email")
									}
								/>
							)}
						/>
					</div>

					{/* Contraseña */}
					<div className="col-md-6">
						<Controller
							name="password"
							control={control}
							rules={{
								required: "Debe escribir una contraseña",
								minLength: {
									value: 8,
									message: "Mínimo 8 caracteres",
								},
							}}
							render={({ field }) => (
								<InputLabel
									id="passwordEmployeeCustomer"
									label="Contraseña:"
									type="password"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={
										errors.password?.message || serverErrorFor("password")
									}
								/>
							)}
						/>
					</div>

					{/* Confirmar contraseña */}
					<div className="col-md-6">
						<Controller
							name="confirmPassword"
							control={control}
							rules={{
								required: "Confirma la contraseña",
								validate: (value: string) => {
									if (watch("password") !== value) {
										return "Las contraseñas no coinciden";
									}
									return true;
								},
							}}
							render={({ field }) => (
								<InputLabel
									id="confirmPasswordEmployeeCustomer"
									label="Confirmar Contraseña:"
									type="password"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									error={
										errors.confirmPassword?.message ||
										serverErrorFor("password_confirmation")
									}
								/>
							)}
						/>
					</div>
				</div>

				<div className="form-text text-muted small text-end my-2">
					<i className="bi bi-info-circle me-1"></i> La contraseña temporal debe tener mínimo 8 caracteres
				</div>

				{serverErrors.general && (
					<div className="alert alert-danger py-2 px-3 small rounded-3 my-3">
						<i className="bi bi-exclamation-triangle-fill me-1"></i> {serverErrors.general.join(" ")}
					</div>
				)}

				<div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
					{onCancel && (
						<button
							type="button"
							className="btn btn-light rounded-pill px-4 fw-semibold text-secondary"
							onClick={onCancel}
						>
							Cancelar
						</button>
					)}
					<button
						type="submit"
						disabled={loading}
						className="btn text-white rounded-pill px-4 fw-bold shadow-sm"
						style={{
							background: "linear-gradient(135deg, #c792df 0%, #9d4edd 100%)",
							border: "none",
							minWidth: "140px",
						}}
					>
						{loading ? (
							<>
								<span className="spinner-border spinner-border-sm me-2" role="status"></span>
								Creando...
							</>
						) : (
							<>
								<i className="bi bi-check-lg me-1"></i> Crear Cliente
							</>
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default AddCustomerForm;
