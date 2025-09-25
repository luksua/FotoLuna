const Home = () => {
    const track = document.getElementById('sliderTrack');
    const items = document.querySelectorAll('.slider-item');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    const totalItems = 6;
    const visibleItems = 3;
    let currentIndex = 0;

    const updateSlider = () => {
        const percent = (100 / visibleItems) * currentIndex;
        track.style.transform = `translateX(-${percent}%)`;
        // Quitar clases anteriores
        items.forEach(item => item.classList.remove('small', 'large'));

        // Asignar clases nuevas
        const visible = [currentIndex, currentIndex + 1, currentIndex + 2];
        visible.forEach((i, idx) => {
            if (items[i]) {
                items[i].classList.add(idx === 1 ? 'large' : 'small'); // el del medio grande
            }
        });
    };

    nextBtn.addEventListener('click', () => {
        if (currentIndex < totalItems - visibleItems) {
            currentIndex++;
            updateSlider();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

    // Inicializar estado
    updateSlider();

    return (
        <div className="container-fluid my-5">
            <div className="slider-container">
                <div className="slider-track" id="sliderTrack">
                    <div className="slider-item"><img src="image/boda.jpg" alt="1" /></div>
                    <div className="slider-item"><img src="image/cumple.jpg" alt="2" /></div>
                    <div className="slider-item"><img src="image/quince.jpg" alt="3" /></div>
                    <div className="slider-item"><img src="image/bautizo.jpg" alt="4" /></div>
                    <div className="slider-item"><img src="image/primerac.jpg" alt="5" /></div>
                    <div className="slider-item"><img src="image/folclor.jpg" alt="6" /></div>
                </div>
                <div className="slider-buttons">
                    <button id="prevBtn" className="btn btn-dark btn-lg rounded-circle">
                        <i className="bi bi-caret-left-fill"></i> {/*<!-- Icono de flecha izquierda -->*/}
                    </button>
                    <button id="nextBtn" className="btn btn-dark btn-lg rounded-circle">
                        <i className="bi bi-caret-right-fill"></i> {/* <!-- Icono de flecha derecha --> */}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;