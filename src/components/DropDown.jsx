import { useEffect, useId, useRef, useState } from "react";
import "./DropDown.css";

export default function DropDown({
  text = "Select",
  options = [],
  value = "",
  onChange = () => {},
  width = "fit-content",
  getOptionImage = () => null,
  placeholderImage = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();
  const selectedImage = value ? getOptionImage(value) : placeholderImage;

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const selectOption = (option) => {
    onChange(option);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className={`dropdown-root${isOpen ? " is-open" : ""}`} style={{ width }}>
      <button
        ref={triggerRef}
        type="button"
        className="dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={`dropdown-preview${value ? "" : " is-placeholder"}`}>
          {selectedImage ? <img src={selectedImage} alt="" /> : null}
        </span>
        <span className="dropdown-trigger-footer">
          <span className={`dropdown-current-value${value ? "" : " is-placeholder"}`}>{value || text}</span>
          <span className="dropdown-chevron" aria-hidden="true" />
        </span>
      </button>

      {isOpen ? (
        <div id={menuId} className="dropdown-menu" role="listbox" aria-label={text}>
          {options.map((option) => {
            const optionImage = getOptionImage(option);
            const isSelected = option === value;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`dropdown-option${isSelected ? " is-selected" : ""}`}
                onClick={() => selectOption(option)}
              >
                <span className={`dropdown-option-media${optionImage ? "" : " is-placeholder"}`}>
                  {optionImage ? <img src={optionImage} alt="" loading="lazy" /> : placeholderImage ? <img src={placeholderImage} alt="" /> : null}
                </span>
                <span className="dropdown-option-label">{option}</span>
                <span className="dropdown-option-indicator" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
