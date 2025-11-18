import HomeNavbar from "../../../../components/Home/HomeNavbar";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

const ForgotPassword: React.FC = () => {
    return (
        <>
            <div className="home-layout">
                <HomeNavbar />
                <ForgotPasswordForm />
            </div>
        </>
    );
};

export default ForgotPassword;