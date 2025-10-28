import EmployeeLayout from "../../../layouts/HomeEmployeeLayout";
import React, { useEffect, useMemo, useState } from "react";
import "../../../styles/AdminEmployee.css";
import imgperfil from "../../../assets/Img/imgperfil.jpg";

type User = {
    id: number;
    name: string;
    email: string;
    phone: string;
    document: string;
    avatar: string;
};

const sampleUsers: User[] = Array.from({ length: 27 }).map((_, i) => {
    const idx = i + 1;
    return {
        id: idx,
        name: `Usuario ${idx}`,
        email: `usuario${idx}@example.com`,
        phone: `+57 300 000 ${String(1000 + idx).slice(-4)}`,
        document: `CC ${10000000 + idx}`,
        avatar: imgperfil,
    };
});

const EmployeeAdmin: React.FC = () => {
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const perPage = 9;

    // Filtro
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return sampleUsers;
        return sampleUsers.filter((u) =>
            [u.name, u.email, u.phone, u.document].some((field) =>
                field.toLowerCase().includes(q)
            )
        );
    }, [query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    useEffect(() => setPage(1), [query]);

    const start = (page - 1) * perPage;
    const pageUsers = filtered.slice(start, start + perPage);

    const goto = (n: number) => setPage(Math.max(1, Math.min(totalPages, n)));

    return (
        <EmployeeLayout>
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
                    {pageUsers.length ? (
                        pageUsers.map((u) => (
                            <article className="admin-card" key={u.id}>
                                <img className="admin-avatar" src={u.avatar} alt={`Foto ${u.name}`} />
                                <div className="admin-info">
                                    <h3>{u.name}</h3>
                                    <p className="muted">{u.email}</p>
                                    <p className="muted">{u.phone}</p>
                                    <p className="muted small">Documento: {u.document}</p>
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

                <footer className="admin-footer">
                    <p>FotoLuna ©</p>
                </footer>
            </div>
        </EmployeeLayout>
    );
};

export default EmployeeAdmin;