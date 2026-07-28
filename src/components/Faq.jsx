import React, { useState } from "react";
import "./Faq.css";
import { getLocale, LOCALES } from '../utils/locale';

export default function Faq({ lang = 'it' }) {
  const locale = LOCALES[lang] || getLocale(lang);
  const fallback = LOCALES.en || getLocale('en');
  const faqData = Array.isArray(locale?.faq?.items) && locale.faq.items.length
    ? locale.faq.items
    : fallback.faq.items;
  const faqTitle = locale?.faq?.title || fallback.faq.title;
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null); // If already open, close it
    } else {
      setActiveIndex(index); // Otherwise open the selected one
    }
  };

  return (
    <section className="faq-section" id="faq">
      <h2 className="faq-title">{faqTitle}</h2>
      <div className="faq-container">
        {faqData.map((item, index) => {
          const isOpen = activeIndex === index;
          return (
            <div 
              key={item.id} 
              className={`faq-item ${isOpen ? "active" : ""}`}
            >
              <button 
                className="faq-question-btn" 
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <span className="faq-icon">{isOpen ? "−" : "+"}</span>
              </button>
              
              <div className="faq-answer-wrapper">
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}