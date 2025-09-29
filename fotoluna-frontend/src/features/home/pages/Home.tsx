import HomeLayout from "../../../layouts/HomeLayout";
import HomeComponent from "../components/Home";
import Comments from "../components/Comments";

const Home = () => {
    return (
        <HomeLayout>
            <HomeComponent />
            <Comments />
        </HomeLayout>
    );
};

export default Home;