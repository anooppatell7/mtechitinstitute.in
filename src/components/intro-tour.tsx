
"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import 'intro.js/introjs.css';

export default function IntroTour() {
    const pathname = usePathname();

    useEffect(() => {
        // Run the tour only on the homepage
        if (pathname !== '/') {
            return;
        }

        const tourWasDone = localStorage.getItem('intro_done');
        if (!tourWasDone) {
            // Start the tour after a short delay to ensure all elements are rendered
            const timer = setTimeout(() => {
                // Access introJs from the window object
                const intro = (window as any).introJs();
                intro.setOptions({
                    steps: [{
                        title: 'Welcome!',
                        intro: 'MTech IT Institute mein aapka swagat hai! 👋 Chaliye aapko website ke kuch khaas features dikhate hain.'
                    },
                    {
                        element: document.querySelector('.download-btn-floating'),
                        intro: 'Yahan se aap hamari official Android App download kar sakte hain, behtar anubhav ke liye.'
                    },
                    {
                        element: document.querySelector('#courses-section'),
                        intro: 'Hamare sabse popular courses yahan dekhein. Aap "View All Courses" par click karke saare courses dekh sakte hain.'
                    }],
                    showProgress: true,
                    showBullets: false,
                    exitOnOverlayClick: false,
                    doneLabel: 'Got it!',
                    tooltipClass: 'custom-intro-tooltip'
                });
                
                intro.oncomplete(() => {
                    localStorage.setItem('intro_done', 'true');
                });
                intro.onexit(() => {
                    localStorage.setItem('intro_done', 'true');
                });

                intro.start();
            }, 1000); // 1-second delay

            return () => clearTimeout(timer);
        }
    }, [pathname]);

    return null; // This component does not render anything
}
