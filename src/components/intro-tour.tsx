
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
                if (typeof window === 'undefined' || !(window as any).introJs) {
                    return;
                }
                const intro = (window as any).introJs();
                
                const isMobile = window.innerWidth < 768;

                // Logic to check if the download button would be visible
                const isAppMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
                const isCustomWebView = navigator.userAgent.includes("MTechApp-WebView");
                const shouldHideDownloadButton = isAppMode || isCustomWebView;

                const baseDesktopSteps = [
                    {
                        title: 'Welcome!',
                        intro: 'MTech IT Institute mein aapka swagat hai! 👋 Chaliye aapko website ke kuch khaas features dikhate hain.'
                    },
                    {
                        element: document.querySelector('[data-intro="Yahan aapko sabhi courses, free resources aur career guidance milegi."]'),
                        title: 'Academics',
                        intro: 'Yahan aapko sabhi courses, free resources aur career guidance milegi.'
                    },
                    {
                        element: document.querySelector('[data-intro="Practice ke liye mock tests aur official exams yahan milenge. Student registration bhi yahin se hoga."]'),
                        title: 'Exams',
                        intro: 'Practice ke liye mock tests aur official exams yahan milenge. Student registration bhi yahin se hoga.'
                    },
                     {
                        element: document.querySelector('[data-intro="Login karne ke baad, aapki profile, learning dashboard aur logout ka option yahan milega."]'),
                        title: 'Your Account',
                        intro: 'Login karne ke baad, aapki profile, learning dashboard aur logout ka option yahan milega.'
                    },
                    {
                        element: document.querySelector('.download-btn-floating'),
                        title: 'Download App',
                        intro: 'Yahan se aap hamari official Android App download kar sakte hain, behtar anubhav ke liye.'
                    },
                    {
                        element: document.querySelector('#courses-section'),
                        title: 'Popular Courses',
                        intro: 'Hamare sabse popular courses yahan dekhein. Aap "View All Courses" par click karke saare courses dekh sakte hain.'
                    }
                ];

                const baseMobileSteps = [
                    {
                        title: 'Welcome!',
                        intro: 'MTech IT Institute mein aapka swagat hai! 👋 Chaliye aapko website ke kuch khaas features dikhate hain.'
                    },
                    {
                        element: document.querySelector('[data-intro="Mobile navigation menu"]'),
                        title: 'Menu',
                        intro: 'Website ke sabhi main sections (jaise Courses, Exams, Blog) aapko yahan milenge.'
                    },
                    {
                        element: document.querySelector('[data-intro-mobile-menu-academics]'),
                        title: 'All Options',
                        intro: 'Menu ke andar aapko Academics, Exams, Blog, etc. jaise saare zaroori links mil jayenge.'
                    },
                    {
                        element: document.querySelector('.download-btn-floating'),
                        title: 'Download App',
                        intro: 'Yahan se aap hamari official Android App download kar sakte hain, behtar anubhav ke liye.'
                    },
                    {
                        element: document.querySelector('#courses-section'),
                        title: 'Popular Courses',
                        intro: 'Hamare sabse popular courses yahan dekhein. Aap "View All Courses" par click karke saare courses dekh sakte hain.'
                    }
                ];

                // Filter out the download button step if it's hidden
                const finalDesktopSteps = shouldHideDownloadButton 
                    ? baseDesktopSteps.filter(step => step.element !== document.querySelector('.download-btn-floating')) 
                    : baseDesktopSteps;
                
                const finalMobileSteps = shouldHideDownloadButton
                    ? baseMobileSteps.filter(step => step.element !== document.querySelector('.download-btn-floating'))
                    : baseMobileSteps;


                intro.setOptions({
                    steps: isMobile ? finalMobileSteps : finalDesktopSteps,
                    showProgress: true,
                    showBullets: false,
                    exitOnOverlayClick: false,
                    doneLabel: 'Got it!',
                    tooltipClass: 'custom-intro-tooltip'
                });

                intro.onbeforechange(function(this: any, targetElement: HTMLElement) {
                    if (isMobile) {
                        const menuButton = document.querySelector('[data-intro="Mobile navigation menu"]');
                        const academicsMenu = document.querySelector('[data-intro-mobile-menu-academics]');
                        
                        if (targetElement === academicsMenu) {
                           // Open the mobile menu before showing the academics step
                           (window as any).toggleMobileMenu(true);
                        } else if (targetElement !== menuButton) {
                           // Close the menu for all other steps
                           (window as any).toggleMobileMenu(false);
                        }
                    }
                });
                
                intro.oncomplete(() => {
                    localStorage.setItem('intro_done', 'true');
                    (window as any).toggleMobileMenu(false); // Ensure menu is closed on completion
                });
                intro.onexit(() => {
                    localStorage.setItem('intro_done', 'true');
                    (window as any).toggleMobileMenu(false); // Ensure menu is closed on exit
                });

                // Only start if there are valid elements to attach to.
                if (document.querySelector('[data-intro]')) {
                    intro.start();
                }
            }, 1500); // 1.5-second delay

            return () => clearTimeout(timer);
        }
    }, [pathname]);

    return null; // This component does not render anything
}
