import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useOffcanvasCleanup = () => {
    const location = useLocation();

    useEffect(() => {
        // Limpiar backdrop cuando cambie la ruta
        const cleanupBackdrop = () => {
            const backdrop = document.querySelector('.offcanvas-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            
            // Remover clases del body
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };

        cleanupBackdrop();
    }, [location]);
};
