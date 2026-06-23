import React, { useState } from "react";
import "./Faq.css";

// ==========================================
// MODIFICA QUI LE TUE DOMANDE E RISPOSTE
// ==========================================
const faqData = [
  {
    id: "ports",
    question: "Da quali porti partono i tour?",
    answer: "I nostri tour partono principalmente dai porti principali della costa: Genova, Nervi, Camogli, S. Margherita, Portofino, Rapallo."
  },
  {
    id: "cancellation",
    question: "Qual è la politica di cancellazione?",
    answer: "È possibile cancellare gratuitamente fino a 72 ore prima della partenza. Per cancellazioni successive a tale termine, non è previsto il rimborso."
  },
  {
    id: "weather",
    question: "Cosa succede in caso di maltempo?",
    answer: "In caso di condizioni meteo avverse che impediscono la navigazione in sicurezza, il tour verrà posticipato o, se non trovi un'altra data disponibile, verrai rimborsato al 100%."
  },
  {
    id: "what-to-bring",
    question: "Cosa è consigliato portare a bordo?",
    answer: "Consigliamo di portare acqua, crema solare, costume da bagno, un telo mare e occhiali da sole. A bordo ti forniremo acqua, asciugamani ed attrezzatura da snorkeling. Restate Leggeri!"
  },
  {
    id: "what-is-included",
    question: "Cosa è incluso nel tour?",
    answer: "A bordo troverete diverse amenità, tra cui asciugamani puliti, snack, bevande fresche, musica e attrezzatura da snorkeling. I pasti non sono inclusi ma siete liberi di portare i vostri!."
  },
  {
    id: "are-animals-allowed",
    question: "Gli animali domestici sono ammessi a bordo?",
    answer: "Sì, siamo molto felici di ospitare i vostri amici a due o quattro zampe, ma devono essere tenuti sotto controllo costante."
  },
  {
    id: "is-boat-safe",
    question: "La barca è sicura?",
    answer: "Sì, la nostra flotta è costituita da barche ben manutenute, con tutti i necessari dispositivi di sicurezza a bordo, sia obbligatori che facoltativi."
  }
];

export default function Faq() {
  // Stato per tenere traccia di quale FAQ è aperta (null = nessuna)
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null); // Se è già aperta, la chiude
    } else {
      setActiveIndex(index); // Altrimenti apre quella selezionata
    }
  };

  return (
    <section className="faq-section" id="faq">
      <h2 className="faq-title">Domande Frequenti (FAQ)</h2>
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