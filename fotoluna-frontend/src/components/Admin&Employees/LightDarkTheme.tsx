import { useState, useEffect } from "react";
import "../../styles/Theme.css";

function ThemeToggle() {
    // Leer tema guardado o usar por defecto "light"
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    // Aplicar el tema en el HTML al iniciar o cambiar
    useEffect(() => {
        const theme = isDarkMode ? "dark" : "light";
        document.documentElement.setAttribute("data-bs-theme", theme);
        localStorage.setItem("theme", theme);
    }, [isDarkMode]);

    // Cambiar tema
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                outline: 'none',
                
            }}
        >
            <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
        </button>
    );
}

export default ThemeToggle;
