import fondo from "../../../assets/Img/fondo.png";
import "../../../styles/AdminHome.css";

const AdminHome = () => {
    return (
        <div className="admin-home-container">
            <div className="admin-home-text">
                <h1 className="admin-home-title">
                    Bienvenido
                </h1>
            </div>
            <img src={fondo} alt="fondo" className="admin-home-image"/>
        </div>
    );
};

export default AdminHome;