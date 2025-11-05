import HomeLayout from "../../../layouts/HomeAdminLayouts";
import { useState } from "react";

const Register = () => {
    const [form, setForm] = useState({
        name: "",
        lastName: "",
        phone: "",
        eps: "",
        documentType: "",
        documentNumber: "",
        email: "",
        address: "",
        photo: null,
        hojaDeVida: null
    });
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, files } = e.target as HTMLInputElement;
        if (name === "photo" || name === "hojaDeVida") {
            setForm({ ...form, [name]: files && files[0] });
        } else {
            setForm({ ...form, [name]: value }
                
            );
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("Usuario registrado correctamente");
        setForm({
            name: "",
            lastName: "",
            phone: "",
            eps: "",
            documentType: "",
            documentNumber: "",
            email: "",
            address: "",
            photo: null,
            hojaDeVida: null
        });
    };


    return (
        <HomeLayout>
            <div className="admin-home-container" style={{ maxWidth: 700, margin: "0 auto", padding: 24, background: "#f5f5f8ff", borderRadius: 12 }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
                    <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 16 }}>

                        <label>Nombre:</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required style={inputStyle} />

                        <label>Teléfono:</label>
                        <input type="text" name="phone" value={form.phone} onChange={handleChange} required style={inputStyle} />

                        <label>Tipo de Documento:</label>
                        <select 
                            name="documentType" 
                            value={form.documentType} 
                            onChange={handleChange} 
                            required 
                            style={{
                                ...inputStyle,
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237c5e8c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                backgroundSize: '16px',
                                paddingRight: '40px'
                            }}
                        >
                            <option value="">Seleccione un tipo</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CC">Cédula de Ciudadanía</option>
                        </select>

                        <label>Correo:</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} />

                        <label>Hoja de vida:</label>

                        <div style={fileBoxStyle}>
                            <input type="file" name="hojaDeVida" accept=".pdf,.doc,.docx" onChange={handleChange} style={{ display: "none" }} id="hojaDeVida" />
                            <label htmlFor="hojaDeVida" style={fileLabelStyle}>Elegir archivo</label>
                            {form.hojaDeVida && <span style={{ marginLeft: 8 }}>{(form.hojaDeVida as File).name}</span>}
                        </div>

                    </div>
                    <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 16 }}>
                        <label>Apellido:</label>
                        <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required style={inputStyle} />

                        <label>EPS:</label>
                        <input type="text" name="eps" value={form.eps} onChange={handleChange} required style={inputStyle} />

                        <label>Número de Documento:</label>
                        <input type="text" name="documentNumber" value={form.documentNumber} onChange={handleChange} required style={inputStyle} />

                        <label>Dirección:</label>
                        <input type="text" name="address" value={form.address} onChange={handleChange} required style={inputStyle} />

                        <label>Foto:</label>
                        <div style={fileBoxStyle}>
                            <input type="file" name="photo" accept="image/*" onChange={handleChange} style={{ display: "none" }} id="photo" />
                            <label htmlFor="photo" style={fileLabelStyle}>Elegir archivo</label>
                            {form.photo && <span style={{ marginLeft: 8 }}>{(form.photo as File).name}</span>}
                        </div>
                    </div>
                    
                    <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 24 }}>
                        <button type="submit" style={{ padding: "12px 40px", fontSize: 18, background: "#d1a3e2", color: "#fff", border: "none", borderRadius: 24, fontWeight: "bold" }}>
                            Aceptar
                        </button>
                    </div>
                </form>
                {message && <p style={{ color: "#a36fc2", marginTop: 16, textAlign: "center" }}>{message}</p>}
            </div>

            <footer>
                <p>FotoLuna &copy;  </p>
            </footer>
            
        </HomeLayout>
    );
};

const inputStyle = {
    background: "#e6d6ed",
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 16,
    color: "#7c5e8c"
};

const fileBoxStyle = {
    display: "flex",
    alignItems: "center",
    border: "2px dashed #d1a3e2",
    borderRadius: 8,
    padding: "8px 12px",
    background: "#f3eaf7"
};

const fileLabelStyle = {
    background: "#e6d6ed",
    color: "#a36fc2",
    padding: "6px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold"
};



export default Register;