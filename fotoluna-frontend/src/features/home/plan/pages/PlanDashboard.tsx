import HomeNavbar from "../../../../components/Home/HomeNavbar";
import PlanComponent from "../components/PlanDashboard";

const Appointment: React.FC = () => {
    return (
        <>
            <div className="home-layout">
                <HomeNavbar />
                <PlanComponent />
            </div>
        </>
    );
};

export default Appointment;