import HomeNav from "../../../../components/Home/HomeNavbar";
import ProfilePage from "../components/Profile";

const AboutMe = () => {
    return (
        <>
            <div className="home-layout">
                <HomeNav />
                <ProfilePage />
            </div>
        </>
    );
};

export default AboutMe;