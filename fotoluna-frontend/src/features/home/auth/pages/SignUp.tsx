import HomeNavbar from "../../../../components/Home/HomeNavbar";
import SignUpForm from "../components/SignUpForm";

const Register: React.FC = () => {
    return (
        <>
            <div className="home-layout">
                <HomeNavbar />
                <SignUpForm />
            </div>
        </>
    );
};

export default Register;