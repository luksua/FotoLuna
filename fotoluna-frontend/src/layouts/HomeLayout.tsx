import React from "react";
import NavHome from "../components/HomeNavbar";

type Props = {
    children: React.ReactNode;
};

const HomeLayout: React.FC<Props> = ({ children }) => {
    return (
        <div>
            <NavHome />
            <main className="flex-1 p-6 bg-gray-100">{children}</main>
        </div>
    );
};

export default HomeLayout;