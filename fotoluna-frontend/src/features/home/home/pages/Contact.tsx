import HomeLayout from "../../../../layouts/HomeLayout";
import ContactComponent from "../components/Contact";
import Comments from "../components/Comments";

const Contact = () => {
    return (
        <HomeLayout>
            <ContactComponent />
            <Comments />
            <br />
        </HomeLayout>
    );
};

export default Contact;