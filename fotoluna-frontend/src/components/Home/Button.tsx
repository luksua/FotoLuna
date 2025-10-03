import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
    value?: string;
    children?: ReactNode;
    onClick?: () => void;
    to?: string;
}

const Button = ({ value, children, onClick, to }: Props) => {
    if (to) {
        return (
            <Link
                to={to}
                className="btn btn-perfil w-100"
                onClick={onClick}
            >
                {children ?? value}
            </Link>
        );
    }
    return (
        <button
            type="submit"
            onClick={onClick}
            className="btn custom-upload-btn"
        >
            {children ?? value}
        </button>
    );
};

export default Button;