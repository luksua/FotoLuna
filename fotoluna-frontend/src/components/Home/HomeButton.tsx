import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
    value?: string;
    children?: ReactNode;
    onClick?: () => void;
    to?: string;
}

const HomeButton = ({ value, children, onClick, to }: Props) => {
    if (to) {
        return (
            <Link to={to} className="btn btn-perfil w-100">
                {children ?? value}
            </Link>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            className="btn btn-perfil w-100"
        >
            {children ?? value}
        </button>
    );
};

export default HomeButton;