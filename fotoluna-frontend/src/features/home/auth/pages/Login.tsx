import HomeNavbar from "../../../../components/Home/HomeNavbar";
import LoginForm from "../components/LoginForm";

const Login: React.FC = () => {
    return (
        <>
            <div className="home-layout">
                <HomeNavbar />
                <LoginForm />
            </div>
        </>
    );
};

export default Login;