import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
    value?: string;
    children?: ReactNode;
    onClick?: () => void;
    to?: string;
    className?: string;
}

const Button = ({ value, children, onClick, to, className }: Props) => {
    if (to) {
        return (
            <Link
                to={to}
                className={className}
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
            className={`btn ${className ?? "custom-upload-btn"}`}
        >
            {children ?? value}
        </button>
    );
};

export default Button;