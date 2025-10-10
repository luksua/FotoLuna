import fondo from "../../../assets/Img/fondo.png";
import HomeLayout from "../../../layouts/HomeAdminLayouts";
import "../../../styles/AdminHome.css";

const AdminHome = () => {

    return (
        <HomeLayout>
            <div className="admin-home-container">
            <div className="admin-home-text">
                <h1 className="admin-home-title">
                    Bienvenido
                </h1>
            </div>
            <img src={fondo} alt="fondo" className="admin-home-image"/>
        </div>

        </HomeLayout>
        
    );
};

export default AdminHome;