import HomeLayout from "../../../../layouts/HomeLayout";
import HomeComponent from "../components/Home";
import Maternity from "../../events/maternity/components/Maternity";
import Birthday from "../../events/birthdays/components/Birthday";
import Quinces from "../../events/quinces/components/Quinces";
import Wedding from "../../events/weddings/components/Wedding";
import Baptism from "../../events/baptisms/components/Baptism";
import Document from "../../events/documents/components/Documents"
import Graduation from "../../events/graduation/components/Graduation"
import OtherServices from "../../events/others/components/Others";

const Home = () => {
    return (
        <HomeLayout>
            <HomeComponent />
            <br /><br />
            <Maternity />
            <br />
            <Birthday />
            <br />
            <Quinces />
            <br /><br />
            <Wedding />
            <br /><br />
            <Baptism />
            <br /><br />
            <Document />
            <br /><br />
            <Graduation />
            <br /><br />
            <OtherServices/>
            <br /><br />
        </HomeLayout>
    );
};

export default Home;