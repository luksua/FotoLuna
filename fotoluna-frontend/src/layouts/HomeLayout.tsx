import React from "react";
import HomeNav from "../components/Home/HomeNavbar";
import HomeFooter from "../components/Home/HomeFooter";
import { useOffcanvasCleanup } from "../hooks/useOffcanvasCleanup";

type Props = {
    children: React.ReactNode;
};

const HomeLayout: React.FC<Props> = ({ children }) => {
    useOffcanvasCleanup();
    
    return (
        <div className="home-layout">
            <HomeNav />
            <main>{children}</main>
            <HomeFooter />
        </div>
    );
};

export default HomeLayout;