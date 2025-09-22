import React from "react";
import HomeNav from "../components/HomeNavbar";
import HomeFooter from "../components/HomeFooter";

type Props = {
    children: React.ReactNode;
};

const HomeLayout: React.FC<Props> = ({ children }) => {
    return (
        <div>
            <HomeNav />
            <main>{children}</main>
            <HomeFooter />
        </div>
    );
};

export default HomeLayout;