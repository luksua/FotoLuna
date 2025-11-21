import HomeNavbar from "../../../../components/Home/HomeNavbar";
import AppoinmentComponent from "../components/Appointment";

const Appointment: React.FC = () => {
    return (
        <>
            <div className="home-layout">
                <HomeNavbar />
                <AppoinmentComponent />
            </div>
        </>
    );
};

export default Appointment;