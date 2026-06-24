import { useEffect, useRef } from "react";
import "./Masonry.css";
import img1 from "../assets/florence.webp";
import img2 from "../assets/aperitivo.webp";
import img3 from "../assets/nonna.webp";
import img4 from "../assets/ok.webp";
import img5 from "../assets/sorso.webp";
import img6 from "../assets/thedad.webp";
import img7 from "../assets/yalla.webp";
import img8 from "../assets/tuffoo.webp";
import img9 from "../assets/tuffoo.webp";

export default function Masonry() {
  const wrapperRef = useRef(null);
  const columnRefs = useRef([]);
  const ticking = useRef(false);

  useEffect(() => {
    const updateParallax = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
      const amount = 40;
      const offsets = [
        (progress - 0.5) * amount,
        (0.5 - progress) * amount,
        (progress - 0.5) * amount,
      ];

      columnRefs.current.forEach((column, index) => {
        if (column) {
          column.style.transform = `translateY(${offsets[index]}px)`;
        }
      });
    };

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        updateParallax();
        ticking.current = false;
      });
    };

    updateParallax();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="masonry-wrapper" ref={wrapperRef}>
      <div className="column column-1" ref={(el) => (columnRefs.current[0] = el)}>
        <div className="item">
          <img src={img1} alt="Aperitivo" />
        </div>
        <div className="item">
          <img src={img2} alt="Aperitivo" />
        </div>
        <div className="item">
          <img src={img3} alt="Aperitivo" />
        </div>
      </div>
      <div className="column column-2" ref={(el) => (columnRefs.current[1] = el)}>
        <div className="item">
          <img src={img4} alt="Aperitivo" />
        </div>
        <div className="item">
          <img src={img5} alt="Aperitivo" />
        </div>
        <div className="item">
          <img src={img6} alt="Aperitivo" />
        </div>
      </div>
      <div className="column column-3" ref={(el) => (columnRefs.current[2] = el)}>
        <div className="item">
          <img src={img7} alt="Aperitivo" />
        </div>
        <div className="item">
          <img src={img8} alt="Aperitivo" />
        </div>
        <div className="item">
          <img src={img9} alt="Aperitivo" />
        </div>
      </div>
    </div>
  );
}
