import HomeLayout from "../../../../layouts/HomeLayout";
import Comments from "../../../home/components/Comments";
import Quinces from "../components/Quinces";

const Home = () => {
    return (
        <HomeLayout>
            <Quinces />
            <br /><br />
            <Comments />
        </HomeLayout>
    );
};

export default Home;