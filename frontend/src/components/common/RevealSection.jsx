import { useEffect, useState, useRef } from 'react';

const animationVariants = {
    fade: (isVisible) => isVisible ? 'opacity-100' : 'opacity-0',
    slide: (isVisible) => isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12',
    scale: (isVisible) => isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
    blur: (isVisible) => isVisible ? 'opacity-100 blur-0' : 'opacity-0 blur-sm',
};

export default function RevealSection({ 
    children, 
    className = '', 
    threshold = 0.1, 
    variant = 'slide',
    delay = 0 
}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let timeoutId;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (delay > 0) {
                        timeoutId = setTimeout(() => setIsVisible(true), delay);
                    } else {
                        setIsVisible(true);
                    }
                    observer.unobserve(entry.target);
                }
            },
            { threshold, rootMargin: '0px 0px -50px 0px' }
        );

        if (ref.current) observer.observe(ref.current);
        return () => {
            observer.disconnect();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [threshold, delay]);

    const animationClass = animationVariants[variant] 
        ? animationVariants[variant](isVisible) 
        : animationVariants.slide(isVisible);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out transform ${animationClass} ${className}`}
        >
            {children}
        </div>
    );
}