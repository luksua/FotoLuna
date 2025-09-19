import type { ReactNode } from "react";

type Props = {
    value?: string;
    children?: ReactNode;
    type?: "submit" | "button";
    onClick?: () => void;
}

const HomeButton = ({ value, children, type, onClick }: Props) => {
    return (
        <button
            type = {type ?? "button"}
            onClick={onClick}
            className = "btn btn-perfil w-100"
        >
            {children ?? value}
        </button>
    );
};

export default HomeButton;