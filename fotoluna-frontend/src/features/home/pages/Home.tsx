import HomeLayout from "../../../layouts/HomeLayout";
import HomeComponent from "../components/Home";
import Comments from "../components/Comments";

const Home = () => {
    return (
        <HomeLayout>
            <HomeComponent />
            <br /><br />
            <Comments />
        </HomeLayout>
    );
};

export default Home;