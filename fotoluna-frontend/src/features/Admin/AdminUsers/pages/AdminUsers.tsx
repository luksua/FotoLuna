import HomeLayout from "../../../../layouts/HomeAdminLayout";
import React, { useEffect, useMemo, useState } from "react";
import "../../../Admin/AdminUsers/styles/AdminUsers.css";
import imgperfil from "../../../../assets/Img/imgperfil.jpg";

type User = {
    id: number;
    name: string;
    email: string;
    phone: string;
    document: string;
    avatar: string;
};



type TabType = 'info' | 'reservas' | 'historial';

interface ModalProps {
    user: User;
    onClose: () => void;
}

const UserModal: React.FC<ModalProps> = ({ user, onClose }) => {
    const [activeTab, setActiveTab] = useState<TabType>('info');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-tabs">
                        <button
                            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            Información
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'reservas' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reservas')}
                        >
                            Reservas
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'historial' ? 'active' : ''}`}
                            onClick={() => setActiveTab('historial')}
                        >
                            Historial
                        </button>
                    </div>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {activeTab === 'info' && (
                        <div className="user-detail">
                            <img className="modal-avatar" src={user.avatar} alt={`Foto ${user.name}`} />
                            <h2>{user.name}</h2>
                            <p>Correo: {user.email}</p>
                            <p>Teléfono: {user.phone}</p>
                            <p>Documento: {user.document}</p>
                        </div>
                    )}
                    {activeTab === 'reservas' && (
                        <div className="reservas-content">
                            <h3>Reservas Activas</h3>
                            <p>No hay reservas activas</p>
                        </div>
                    )}
                    {activeTab === 'historial' && (
                        <div className="historial-content">
                            <h3>Historial de Servicios</h3>
                            <p>No hay historial disponible</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const EmployeeAdmin: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch('/api/admin/employees')
            .then((res) => res.json())
            .then((data) => {
                if (!mounted) return;
                if (data && data.success) {
                    const mapped: User[] = data.data.map((e: any) => ({
                        id: e.id,
                        name: e.name,
                        email: e.email,
                        phone: e.phone || '',
                        document: e.document || '',
                        avatar: e.avatar || imgperfil,
                    }));
                    setUsers(mapped);
                } else {
                    setError('No se pudieron cargar los empleados');
                }
            })
            .catch((err) => {
                setError(err.message || 'Error al obtener empleados');
            })
            .finally(() => setLoading(false));

        return () => {
            mounted = false;
        };
    }, []);

    ////////// paginacion y filtro
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const perPage = 9;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) =>
            [u.name, u.email, u.phone, u.document].some((field) =>
                (field || '').toLowerCase().includes(q)
            )
        );
    }, [query, users]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    useEffect(() => setPage(1), [query]);

    const start = (page - 1) * perPage;
    const pageUsers = filtered.slice(start, start + perPage);

    const goto = (n: number) => setPage(Math.max(1, Math.min(totalPages, n)));

    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
        <HomeLayout>
            <div className="admin-root">
                <header className="admin-head">
                    <div className="search-row">
                        <input
                            type="search"
                            className="search-input"
                            placeholder="Buscar por nombre, email, teléfono o documento..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="search-count">{filtered.length} resultados</div>
                    </div>
                </header>
            </div>

            <div className="admin-content">
                <section className="admin-grid">
                    {loading ? (
                        <div style={{ gridColumn: "1/-1", textAlign: "center" }}>Cargando empleados...</div>
                    ) : pageUsers.length ? (
                        pageUsers.map((u) => (
                            <article className="admin-card" key={u.id}>
                                <img className="admin-avatar" src={u.avatar || imgperfil} alt={`Foto ${u.name}`} />
                                <div className="admin-info">
                                    <h3>{u.name}</h3>
                                    <p className="muted">Correo: {u.email}</p>
                                    <p className="muted">Teléfono: {u.phone}</p>
                                    <p className="muted small">Documento: {u.document}</p>
                                    <button
                                        className="ver-mas-btn"
                                        onClick={() => setSelectedUser(u)}
                                    >
                                        Ver más
                                    </button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--muted)" }}>
                            No se encontraron usuarios.
                        </div>
                    )}
                </section>

                <nav className="admin-pagination" aria-label="Paginación usuarios">
                    <button onClick={() => goto(page - 1)} disabled={page === 1}>
                        &larr;
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                        const n = i + 1;
                        return (
                            <button
                                key={n}
                                className={n === page ? "active" : ""}
                                onClick={() => goto(n)}
                            >
                                {n}
                            </button>
                        );
                    })}

                    <button onClick={() => goto(page + 1)} disabled={page === totalPages}>
                        &rarr;
                    </button>
                </nav>
            </div>

            {selectedUser && (
                <UserModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            <footer className="admin-footer">
                <p>FotoLuna ©</p>
            </footer>
        </HomeLayout>
    );
};

export default EmployeeAdmin;