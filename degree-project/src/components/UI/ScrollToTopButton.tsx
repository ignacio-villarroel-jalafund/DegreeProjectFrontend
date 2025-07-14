import React, { useState, useEffect } from 'react';
import { MdKeyboardArrowUp } from "react-icons/md";
import styles from './ScrollToTopButton.module.css';

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [bottomPosition, setBottomPosition] = useState('2rem');

    const handleScroll = () => {
        const scrollThreshold = 300;
        if (window.scrollY > scrollThreshold) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }

        const footer = document.querySelector('footer');
        if (footer) {
            const footerHeight = footer.offsetHeight;
            const spaceToDocumentBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
            const bottomPadding = 20;

            if (spaceToDocumentBottom < footerHeight) {
                setBottomPosition(`${footerHeight + bottomPadding}px`);
            } else {
                setBottomPosition('2rem');
            }
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className={styles.scrollButton}
                    style={{ bottom: bottomPosition }}
                    aria-label="Volver arriba"
                >
                    <MdKeyboardArrowUp />
                </button>
            )}
        </>
    );
};

export default ScrollToTopButton;
