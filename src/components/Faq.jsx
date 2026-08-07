import React, { useState } from "react";
import "./Faq.css";
import { getLocale, LOCALES } from '../utils/locale';

export default function Faq({ lang = 'en' }) {
  const locale = LOCALES[lang] || getLocale(lang);
  const fallback = LOCALES.en || getLocale('en');
  const faqData = Array.isArray(locale?.faq?.items) && locale.faq.items.length
    ? locale.faq.items
    : fallback.faq.items;
  const faqTitle = locale?.faq?.title || fallback.faq.title;
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex((currentIndex) => currentIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="faq-layout">
        <h2 className="faq-title" id="faq-title">{faqTitle}</h2>
        <div className="faq-container">
          {faqData.map((item, index) => {
            const isOpen = activeIndex === index;
            const answerId = `faq-${lang}-${item.id}-answer`;
            return (
              <article
                key={item.id}
                className={`faq-item ${isOpen ? "active" : ""}`}
              >
                <h3>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                  >
                    <span>{item.question}</span>
                    <span className="faq-icon" aria-hidden="true" />
                  </button>
                </h3>

                <div
                  className="faq-answer-wrapper"
                  id={answerId}
                  aria-hidden={!isOpen}
                >
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}