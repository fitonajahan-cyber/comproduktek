import { useState, useEffect } from "react";

const heroImages = ["/bg-4.webp", "/bg-3.webp", "/bg-2.webp", "/bg-1.webp"];

const SLIDE_DURATION = 5000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0">
      {heroImages.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Ilustrasi Dukungan Teknologi Siber ${i + 1}`}
          width="1672"
          height="941"
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
