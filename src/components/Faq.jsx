import React, { useState } from "react";
import "./Faq.css";

// ==========================================
// MODIFICA QUI LE TUE DOMANDE E RISPOSTE
// ==========================================
const faqData = [
  {
    id: "ports",
    question: "Which ports do the tours depart from?",
    answer: "Our tours depart from the main ports on the coast: Genoa (Porto Antico), Nervi, Recco, Camogli, S. Margherita, Portofino, Rapallo."
  },
  {
    id: "cancellation",
    question: "What is the cancellation policy?",
    answer: "You can cancel for free up to 72 hours before departure. For cancellations after that deadline, no refund is provided."
  },
  {
    id: "weather",
    question: "What happens in case of bad weather?",
    answer: "In case of adverse weather conditions that prevent safe navigation, the tour will be postponed or, if you don't find another available date, you will be refunded 100%."
  },
  {
    id: "what-to-bring",
    question: "What is recommended to bring on board?",
    answer: "We recommend bringing water, sunscreen, swimsuit, a beach towel, and sunglasses. We'll provide water, towels, and snorkeling equipment on board. Stay Light!"
  },
  {
    id: "what-is-included",
    question: "What is included in the tour?",
    answer: "You'll find various amenities on board, including clean towels, snacks, fresh beverages, music, and snorkeling equipment. Meals are not included but you're welcome to bring your own! Fuel is included, zero surprise charges!"
  },
  {
    id: "are-animals-allowed",
    question: "Are pets allowed on board?",
    answer: "Yes, we're very happy to welcome your furry friends, but they must be kept under constant supervision."
  },
  {
    id: "is-boat-safe",
    question: "Is the boat safe?",
    answer: "Yes, our fleet consists of well-maintained boats with all necessary safety devices on board, both mandatory and optional."
  }
];

export default function Faq() {
  // Stato per tenere traccia di quale FAQ è aperta (null = nessuna)
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
      <h2 className="faq-title">Frequently Asked Questions (FAQ)</h2>
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