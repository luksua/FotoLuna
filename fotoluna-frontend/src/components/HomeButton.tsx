import type { ReactNode } from "react";

type Props = {
    value?: string;
    children?: ReactNode;
    onClick?: () => void;
}

const HomeButton = ({ value, children, onClick }: Props) => {
    return (
        <button
            type = "button"
            onClick={onClick}
            className = "btn btn-perfil w-100"
        >
            {children ?? value}
        </button>
    );
};

export default HomeButton;