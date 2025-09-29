import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
    value?: string;
    children?: ReactNode;
    onClick?: () => void;
    to?: string;
}

const HomeButton = ({ value, children, onClick, to }: Props) => {

    const handleClick = () => {
        // Limpiar el backdrop manualmente
        const backdrop = document.querySelector('.offcanvas-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        if (onClick) {
            onClick();
        }
    };

    if (to) {
        return (
            <Link 
                to={to} 
                className="btn btn-perfil w-100"
                onClick={handleClick}
            >
                {children ?? value}
            </Link>
        );
    }
    return (
        <button
            type="button"
            onClick={handleClick}
            className="btn btn-perfil w-100"
        >
            {children ?? value}
        </button>
    );
};

export default HomeButton;