import HomeNavbar from "../../../../components/Home/HomeNavbar";
import AppointmentComponent from "../components/AppointmentForm";

const AppointmentForm: React.FC = () => {
    return (
        <>
            <div className="home-layout">
                <HomeNavbar />
                <AppointmentComponent />
            </div>
        </>
    );
};

export default AppointmentForm;