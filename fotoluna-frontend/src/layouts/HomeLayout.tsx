import React from "react";
import NavHome from "../components/HomeNavbar";

type Props = {
    children: React.ReactNode;
};

const HomeLayout: React.FC<Props> = ({ children }) => {
    return (
        <div>
            <NavHome />
            <main>{children}</main>
        </div>
    );
};

export default HomeLayout;