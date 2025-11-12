import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Button from "../../../../components/Home/Button";
import "../styles/account.css";
import "../../../../styles/cropper.css";
import api from "../../../../lib/api";
import { useAuth } from "../../../../context/useAuth";
import { Cropper } from "react-cropper";
import type { ReactCropperElement } from "react-cropper";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ProfileForm {
    name: string;
    lastName: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const PROFILE_UPDATE_URL = "/api/customer"; // PATCH
const PASSWORD_UPDATE_URL = "/api/customer/password"; // POST
const PROFILE_GET_URL = "/api/me"; // GET
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const LOCAL_PLACEHOLDER = "/img/imagenperfil.jpg"; // asegúrate de tener este archivo en public/img/

export default function ProfilePage() {
    const auth = useAuth();
    const [form, setForm] = useState<ProfileForm>({
        name: "",
        lastName: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [originalFile, setOriginalFile] = useState<File | null>(null); // archivo seleccionado originalmente
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // archivo final recortado para enviar
    const [preview, setPreview] = useState<string>(LOCAL_PLACEHOLDER);
    const [showModal, setShowModal] = useState(false);
    const cropperRef = useRef<ReactCropperElement>(null);
    const [rawImage, setRawImage] = useState<string | null>(null); // URL blob o dataURL para el cropper

    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Estados separados para mensajes (perfil vs contraseña)
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    // Configuración auth header (si guardas token)
    useEffect(() => {
        const token = (auth as any)?.token ?? localStorage.getItem("token");
        if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // si usas Sanctum+cookies: api.defaults.withCredentials = true;
    }, [auth]);

    // Cargar datos del usuario
    useEffect(() => {
        let mounted = true;
        const mapAndSet = (data: any) => {
            const userPayload = data?.user ?? data;
            const photo = data?.photo ?? userPayload?.photo ?? null;
            const firstName = data?.firstName ?? userPayload?.firstName ?? userPayload?.name ?? "";
            const lastName = data?.lastName ?? userPayload?.lastName ?? "";
            const email = userPayload?.email ?? "";

            if (mounted) {
                setForm((f) => ({ ...f, name: firstName ?? "", lastName: lastName ?? "", email: email ?? "" }));
                if (photo) setPreview(photo);
            }
        };

        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(PROFILE_GET_URL);
                mapAndSet(data);
            } catch (err) {
                const userFromAuth = (auth as any)?.user;
                if (userFromAuth) mapAndSet(userFromAuth);
                else console.warn("No se pudo obtener /me", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if ((auth as any)?.user) {
            mapAndSet((auth as any).user);
            fetchProfile();
        } else {
            fetchProfile();
        }

        return () => {
            mounted = false;
        };
    }, [auth]);

    // Helper: convertir dataURL a File (fallback)
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

    // Abrir modal con archivo seleccionado o preview actual
    const openCropperWithFile = (file?: File) => {
        if (file) {
            const url = URL.createObjectURL(file);
            setRawImage(url);
            setShowModal(true);
        } else {
            // si no hay archivo, usar la preview (si es data: o url pública)
            setRawImage(preview);
            setShowModal(true);
        }
    };

    // manejar selección de archivo
    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        // al seleccionar archivo, limpiamos mensajes para que no confundan
        setProfileError(null);
        setProfileSuccess(null);

        const file = e.target.files?.[0];
        if (!file) return;

        if (!/^image\/(jpeg|png|jpg)$/.test(file.type)) {
            setProfileError("Formato de imagen no permitido. Usa JPG o PNG.");
            return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            setProfileError("La imagen supera el tamaño máximo de 2MB.");
            return;
        }

        setOriginalFile(file); // guardar original
        openCropperWithFile(file);
    };

    // Obtener canvas recortado y convertir a File usando toBlob (más eficiente)
    const applyCrop = () => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        const canvas = cropper.getCroppedCanvas({ width: 400, height: 400, imageSmoothingQuality: "high" });
        if (!canvas) return;

        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
                setSelectedFile(file); // archivo final que se enviará
                // actualizar preview para mostrar al usuario
                const reader = new FileReader();
                reader.onload = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);

                setShowModal(false);
                if (rawImage && rawImage.startsWith("blob:")) {
                    URL.revokeObjectURL(rawImage);
                }
                setRawImage(null);
            },
            "image/jpeg",
            0.9
        );
    };

    const handleImageEditClick = () => {
        // abrir cropper con preview actual
        openCropperWithFile(undefined);
    };

    // Submit perfil (envía FormData con avatar si existe)
    const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // limpiar mensajes de contraseña por si quedaron
        setPasswordError(null);
        setPasswordSuccess(null);
        setProfileError(null);
        setProfileSuccess(null);

        if (!form.name.trim() || !form.lastName.trim()) {
            setProfileError("Nombre y apellido son obligatorios.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setProfileError("Email inválido.");
            return;
        }

        setProfileLoading(true);
        try {
            const fd = new FormData();
            fd.append("name", form.name.trim());
            fd.append("lastName", form.lastName.trim());
            fd.append("email", form.email.trim().toLowerCase());

            const fileToSend = selectedFile ?? originalFile ?? null;

            if (fileToSend instanceof File) {
                fd.append("avatar", fileToSend, fileToSend.name);
            } else if (preview && preview.startsWith("data:image")) {
                const fallbackFile = dataURLtoFile(preview, "avatar.jpg");
                if (fallbackFile instanceof File) fd.append("avatar", fallbackFile, fallbackFile.name);
            }

            const { data } = await api.post(PROFILE_UPDATE_URL, fd, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            });

            setProfileSuccess(data?.message ?? "Perfil actualizado correctamente.");

            // 🔄 Refrescar el perfil (sin recargar toda la página)
            try {
                const meRes = await api.get(PROFILE_GET_URL);
                const payload = meRes.data;

                if ((auth as any)?.setUser) {
                    const newUser = payload?.user ?? payload;
                    (auth as any).setUser(newUser);
                }

                const newPhoto = payload?.photo ?? payload?.user?.photo ?? null;
                if (newPhoto) setPreview(newPhoto);

                setSelectedFile(null);
                setOriginalFile(null);
            } catch (err) {
                console.warn("No se pudo refrescar el perfil:", err);
            }
        } catch (err: any) {
            if (err?.response?.status === 422) {
                const errs = err.response.data?.errors;
                if (errs) {
                    const firstField = Object.keys(errs)[0];
                    setProfileError(errs[firstField]?.[0] ?? "Error de validación.");
                } else {
                    setProfileError(err.response.data?.message ?? "Error de validación.");
                }
            } else {
                setProfileError(err?.response?.data?.message ?? "No se pudo actualizar el perfil.");
            }
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // limpiar mensajes de perfil por si quedaron
        setProfileError(null);
        setProfileSuccess(null);
        setPasswordError(null);
        setPasswordSuccess(null);

        if (!form.currentPassword) {
            setPasswordError("Ingresa tu contraseña actual.");
            return;
        }
        if (form.newPassword.length < 8) {
            setPasswordError("La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            setPasswordError("Las contraseñas no coinciden.");
            return;
        }

        setPasswordLoading(true);
        try {
            const payload = {
                current_password: form.currentPassword,
                new_password: form.newPassword,
                new_password_confirmation: form.confirmPassword,
            };
            const { data } = await api.post(PASSWORD_UPDATE_URL, payload, { headers: { Accept: "application/json" } });
            setPasswordSuccess(data?.message ?? "Contraseña actualizada correctamente.");
            setForm({ ...form, currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            if (err?.response?.status === 422) {
                const errs = err.response.data?.errors;
                if (errs) {
                    const firstField = Object.keys(errs)[0];
                    setPasswordError(errs[firstField]?.[0] ?? "Error de validación.");
                } else {
                    setPasswordError(err.response.data?.message ?? "Error de validación.");
                }
            } else if (err?.response?.status === 401) {
                setPasswordError("Contraseña actual incorrecta.");
            } else {
                setPasswordError(err?.response?.data?.message ?? "No se pudo cambiar la contraseña.");
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) return <div className="container py-5">Cargando perfil...</div>;

    return (
        <div className="container py-3">

            <form onSubmit={handleProfileSubmit} className="bg-white border rounded-4 shadow-sm p-4 mb-4">
                <div className="container-info">
                    <h4 className="fw-semibold mb-3">Información Personal</h4>

                    {/* Mensajes específicos del formulario de perfil */}
                    {profileError && <div className="alert alert-danger">{profileError}</div>}
                    {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

                    <div className="row g-3 mb-3">
                        {/* Imagen de perfil */}
                        <div className="d-flex flex-column align-items-center mb-4 position-relative">
                            <div className="position-relative">
                                <img
                                    src={preview}
                                    alt="Imagen de perfil"
                                    className="rounded-circle border"
                                    style={{ width: 130, height: 130, objectFit: "cover" }}
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        img.onerror = null;
                                        img.src = LOCAL_PLACEHOLDER;
                                    }}
                                />

                                {/* Botón de editar imagen */}
                                <label
                                    htmlFor="profileImage"
                                    className="edit-button position-absolute bottom-0 end-0 text-white rounded-circle p-2 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: 38,
                                        height: 38,
                                        cursor: "pointer",
                                        transform: "translate(20%, 20%)",
                                        boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                                    }}
                                    title="Cambiar imagen"
                                    onClick={handleImageEditClick}
                                >
                                    <i className="bi bi-pencil-square"></i>
                                </label>

                                <input type="file" id="profileImage" accept="image/*" onChange={handleFileInput} className="d-none" />
                            </div>

                            <small className="text-muted mt-2">Formatos permitidos: JPG, PNG. Máx. 2MB</small>
                        </div>

                        {/* Campos */}
                        <div className="col-md-6">
                            <label className="form-label">Nombre</label>
                            <input type="text" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Apellido</label>
                            <input type="text" name="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="form-control" />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Email</label>
                            <input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-control" />
                        </div>
                    </div>



                    <div className="d-flex justify-content-end mt-2">
                        <Button value={profileLoading ? "Guardando..." : "Guardar Cambios"} />
                    </div>
                </div>
            </form>


            {/* Modal Cropper */}
            {showModal && (
                <>
                    <div className="modal fade show" style={{ display: "block" }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Recortar Imagen</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <Cropper
                                        src={rawImage ?? preview}
                                        style={{ height: 400, width: "100%" }}
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
                                        crossOrigin="anonymous"
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancelar
                                    </button>
                                    <button className="btn custom-upload-btn" onClick={applyCrop}>
                                        Recortar Imagen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}

            {/* Cambiar Contraseña */}
            <form onSubmit={handlePasswordSubmit} className="bg-white border rounded-4 shadow-sm p-4">
                <div className="container-info">
                    <h4 className="fw-semibold mb-3">Cambiar Contraseña</h4>
                    <p className="text-muted mb-4">Para cambiar tu contraseña, debes verificar tu identidad.</p>

                    {/* Mensajes específicos del formulario de contraseña */}
                    {passwordError && <div className="alert alert-danger">{passwordError}</div>}
                    {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

                    <div className="row g-3 mb-3">
                        <div className="col-12">
                            <label className="form-label">Ingresa tu contraseña actual</label>
                            <input type="password" name="currentPassword" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Nueva Contraseña</label>
                            <input type="password" name="newPassword" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Confirmar Contraseña</label>
                            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="form-control" />
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <Button value={passwordLoading ? "Cambiando..." : "Guardar Cambios"} />
                    </div>
                </div>
            </form>
        </div>
    );
}