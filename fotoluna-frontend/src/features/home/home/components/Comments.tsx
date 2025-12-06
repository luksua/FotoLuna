/* eslint-disable @typescript-eslint/no-explicit-any */
import "../styles/comments.css";
import { useState, useEffect } from "react";
import imgperfil from "../../../../assets/Img/imgperfil.jpg";

interface Comment {
    id: number;
    rating: number;
    comment_text: string;
    photo_path: string | null;
    is_anonymous: boolean;
    user_name: string;
    user_avatar: string | null;
    photographer_name?: string | null;
    created_at: string;
}

const Comments = () => {
    const [rating, setRating] = useState(0);
    const [formData, setFormData] = useState({
        comment: "",
        photo: null as File | null,
        isAnonymous: false,
        photographerId: "",
    });
    const [photographers, setPhotographers] = useState<{id: number, name: string}[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");

    useEffect(() => {
        fetchComments();
        fetchPhotographers();
    }, []);

    const fetchPhotographers = async () => {
        try {
            // Nueva ruta pública que devuelve todos los employees
            const res = await fetch("/api/employees/all", {
                headers: { Accept: "application/json" }
            });
            const data = await res.json();

            // La ruta devuelve un array plano de empleados
            if (Array.isArray(data)) {
                setPhotographers(
                    data.map((emp: any) => ({
                        id: emp.user_id ?? emp.id,
                        name: emp.name || emp.firstNameEmployee || emp.email || 'Empleado'
                    }))
                );
                return;
            }

            // Por seguridad, manejar estructuras envueltas
            if (data && Array.isArray(data.data)) {
                setPhotographers(
                    data.data.map((emp: any) => ({ id: emp.id, name: emp.name }))
                );
                return;
            }

            setPhotographers([]);
        } catch (err) {
            console.log(Error, err);
            setPhotographers([]);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments`);
            const data = await res.json();
            if (data.success) {
                setComments(data.data);
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    const handleClick = (index: number) => {
        setRating(index + 1);
    };

    const toggleExpanded = (commentId: number) => {
        const newExpanded = new Set(expandedComments);
        if (newExpanded.has(commentId)) {
            newExpanded.delete(commentId);
        } else {
            newExpanded.add(commentId);
        }
        setExpandedComments(newExpanded);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFormData({
                ...formData,
                [name]: (e.target as HTMLInputElement).checked,
            });
        } else if (type === "file") {
            const file = (e.target as HTMLInputElement).files?.[0] || null;
            setFormData({ ...formData, photo: file });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.comment.trim()) {
            setMessage("Por favor escribe un comentario");
            setMessageType("error");
            return;
        }

        if (rating === 0) {
            setMessage("Por favor selecciona una puntuación");
            setMessageType("error");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("Debes iniciar sesión para comentar");
            setMessageType("error");
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("comment_text", formData.comment);
            formDataToSend.append("rating", String(rating));
            formDataToSend.append("is_anonymous", formData.isAnonymous ? "1" : "0");
            if (formData.photographerId) {
                formDataToSend.append("photographer_id", formData.photographerId);
            }
            if (formData.photo) {
                formDataToSend.append("photo", formData.photo);
            }

            const res = await fetch(`/api/comments`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            let data: any = null;
            try {
                data = await res.json();
            } catch (err) {
                console.log(Error, err);
                const text = await res.text();
                setMessage(`Error del servidor: ${res.status} - ${text}`);
                setMessageType("error");
                setLoading(false);
                return;
            }

            if (!res.ok) {
                // Mostrar errores de validación si existen
                if (data.errors) {
                    const errorMessages = Object.values(data.errors)
                        .flat()
                        .join(", ");
                    setMessage(errorMessages);
                } else {
                    setMessage(data.message || "Error al enviar comentario");
                }
                setMessageType("error");
            } else {
                setMessage("Comentario enviado correctamente");
                setMessageType("success");

                // Limpiar formulario
                setFormData({ comment: "", photo: null, isAnonymous: false, photographerId: "" });
                setRating(0);

                // Recargar comentarios
                fetchComments();
            }
        } catch (error: any) {
            setMessage(error?.message || "Error en la petición");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-light">
            <div className="container my-5 py-5">
                <h2 className="text-center mb-4">Comentarios</h2>

                <div className="comentario-box">
                    <form className="form-section" onSubmit={handleSubmit}>
                        <textarea
                            className="form-control mb-3"
                            rows={3}
                            name="comment"
                            placeholder="Escriba aquí un comentario..."
                            value={formData.comment}
                            onChange={handleChange}
                        ></textarea>

                        <div className="row align-items-center mb-3 g-3">
                            <div className="col-md-4">
                                <label className="form-label text-muted small">Fotógrafo (opcional)</label>
                                <select
                                    className="form-select"
                                    name="photographerId"
                                    value={formData.photographerId}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Sin fotógrafo --</option>
                                    {photographers.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label text-muted small">Foto (opcional)</label>
                                <div className="d-flex align-items-center">
                                    <label
                                        htmlFor="profileImage"
                                        className="btn custom-upload-btn custom-file-upload"
                                        style={{ cursor: "pointer", marginRight: "10px" }}
                                    >
                                        <i className="bi bi-camera"></i>
                                    </label>
                                    <input
                                        type="file"
                                        id="profileImage"
                                        name="photo"
                                        className="form-control"
                                        accept="image/*"
                                        hidden
                                        onChange={handleChange}
                                    />
                                    {formData.photo && (
                                        <small className="d-block ms-2">
                                            {formData.photo.name}
                                        </small>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-3 text-center">
                                <label className="form-label text-muted small">Puntúanos</label>
                                <div id="rating">
                                    {[...Array(5)].map((_, index) => (
                                        <i
                                            key={index}
                                            className={`bi ${
                                                index < rating
                                                    ? "bi-camera-fill"
                                                    : "bi-camera"
                                            } icono-camara`}
                                            onClick={() => handleClick(index)}
                                            style={{
                                                cursor: "pointer",
                                                fontSize: "1.5rem",
                                                marginRight: "3px"
                                            }}
                                        ></i>
                                    ))}
                                </div>
                            </div>
                            <div className="col-md-2 d-flex flex-column align-items-center justify-content-center">
                                <label className="form-label text-muted small">Anónimo</label>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="anonimoSwitch"
                                        name="isAnonymous"
                                        checked={formData.isAnonymous}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div
                                className={`alert alert-${
                                    messageType === "success" ? "success" : "danger"
                                } mb-3`}
                                role="alert"
                            >
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-enviar w-100"
                            disabled={loading}
                        >
                            {loading ? "Enviando..." : "Enviar comentario"}
                        </button>
                    </form>
                </div>

                <hr className="my-5" />

                {/* Carrusel/Scroll de comentarios */}
                <div className="comentarios-scroll">
                    {comments.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            No hay comentarios aún. ¡Sé el primero en comentar!
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div className="comentario-card" key={comment.id}>
                                <div className="mb-1">
                                    <img
                                        src={
                                            comment.user_avatar && comment.user_avatar.trim() !== ''
                                                ? comment.user_avatar
                                                : imgperfil
                                        }
                                        alt="Avatar"
                                        className="rounded-circle me-2"
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            objectFit: "cover",
                                        }}
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            img.src = imgperfil;
                                        }}
                                    />
                                    <strong>{comment.user_name}</strong>
                                </div>
                                <div className="mb-2">
                                    {[...Array(5)].map((_, index) => (
                                        <i
                                            key={index}
                                            className={`bi ${
                                                index < comment.rating
                                                    ? "bi-camera-fill"
                                                    : "bi-camera"
                                            }`}
                                        ></i>
                                    ))}
                                </div>
                                {comment.photo_path && (
                                    <div className="mb-2">
                                        <img
                                            src={comment.photo_path}
                                            alt="Foto comentario"
                                            className="rounded"
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "150px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>
                                )}
                                <p className={`mb-0 small ${expandedComments.has(comment.id) ? '' : 'comentario-text-collapsed'}`}>
                                    {comment.photographer_name && (
                                        <span className="fw-bold">Fotógrafo: {comment.photographer_name}<br /></span>
                                    )}
                                    {comment.comment_text}
                                </p>
                                {!expandedComments.has(comment.id) && comment.comment_text.length > 100 && (
                                    <button
                                        className="btn btn-sm btn-link p-0 mt-1"
                                        onClick={() => toggleExpanded(comment.id)}
                                        style={{ color: "#C792DF", textDecoration: "none", fontSize: "0.85rem" }}
                                    >
                                        Ver más
                                    </button>
                                )}
                                {expandedComments.has(comment.id) && comment.comment_text.length > 100 && (
                                    <button
                                        className="btn btn-sm btn-link p-0 mt-1"
                                        onClick={() => toggleExpanded(comment.id)}
                                        style={{ color: "#C792DF", textDecoration: "none", fontSize: "0.85rem" }}
                                    >
                                        Ver menos
                                    </button>
                                )}
                                <small className="text-muted d-block mt-2">
                                    {comment.created_at}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Comments;
