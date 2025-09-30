import "../styles/aboutme.css";

const AboutMe = () => {
    return (
        <section className="aboutme-hero">
            <div className="aboutme-overlay">
                <div className="aboutme-content container">
                    <h2>
                        Sobre <span className="highlight">Mí</span>
                    </h2>
                    <div className="text">
                        <p>
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                            ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
                            in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
                            sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                            mollit anim id est laborum.
                        </p>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae dignissimos
                            mollitia sequi voluptatem porro adipisci, tempore fugit, blanditiis perferendis
                            atque et sunt molestiae eum itaque, quas sint fugiat accusamus? Voluptatem.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutMe;
