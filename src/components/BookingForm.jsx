import React, { useState, useEffect, useRef } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import "./BookingForm.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const countryCodes = [
    { code: "+39", country: "🇮🇹" },
    { code: "+33", country: "🇫🇷" },
    { code: "+41", country: "🇨🇭" },
    { code: "+49", country: "🇩🇪" },
    { code: "+44", country: "🇬🇧" },
];

export default function BookingForm({ onSubmit, boatId = null, date = null, slotKey = null, startTime = null, endTime = null, captainId = null, embark = null, disembark = null, arrangePickup = false, arrangeDropoff = false, numPax = 1, amountCents = 0, onSlotUnavailableRetry = null }) {
    const [form, setForm] = useState({
        fullName: "",
        countryCode: countryCodes[0].code,
        phone: "",
        email: "",
        notes: "",
        amountCents: amountCents || 0,
    });

    // Keep displayed amount in sync if parent recomputes it
    useEffect(() => {
        setForm(f => ({ ...f, amountCents: amountCents || 0 }));
    }, [amountCents]);

    const [paymentPhase, setPaymentPhase] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const [paid, setPaid] = useState(false);
    const paymentCompletedRef = useRef(false);
    const [loading, setLoading] = useState(false);
    const [slotUnavailable, setSlotUnavailable] = useState(false);

    const functions = getFunctions(getApp());

    // When component unmounts, cancel the pending booking if it exists and payment wasn't completed
    useEffect(() => {
        return () => {
            if (bookingId && !paymentCompletedRef.current) {
                try {
                    const cancelFn = httpsCallable(functions, 'cancelPendingBooking');
                    cancelFn({ bookingId, email: form.email }).catch(err => console.error('cancelPendingBooking failed', err));
                } catch (e) {
                    console.error('cancelPendingBooking error', e);
                }
            }
        };
    }, [bookingId, paid, form.email]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    }

    function handleCodeChange(e) {
        setForm(f => ({ ...f, countryCode: e.target.value }));
    }

    async function handleInitialSubmit(e) {
        e.preventDefault();
        // If the slot was flagged unavailable, treat this submission as a retry
        // and ask the parent to go back to the booking view with calendars.
        if (slotUnavailable) {
            if (onSlotUnavailableRetry) onSlotUnavailableRetry();
            setSlotUnavailable(false);
            return;
        }
        setLoading(true);
        try {
            const createPI = httpsCallable(functions, 'createPaymentIntent');
            const payload = {
                boatId: boatId || null,
                date: date || null,
                slotKey: slotKey || null,
                startTime: startTime || null,
                endTime: endTime || null,
                captainId: captainId || null,
                numPax: numPax || 1,
                fullName: form.fullName,
                countryCode: form.countryCode,
                phone: form.phone,
                email: form.email,
                notes: form.notes,
                embark: embark || null,
                disembark: disembark || null,
                arrangePickup: !!arrangePickup,
                arrangeDropoff: !!arrangeDropoff,
            };


            const res = await createPI(payload);
            const { clientSecret: cs, bookingId: bid } = res.data;
            setClientSecret(cs);
            setBookingId(bid);
            setPaymentPhase(true);
        } catch (err) {
            console.error('createPaymentIntent failed', err);
            const code = err?.code || (err?.details && err?.details?.code);
            if (code === 'already-exists' || (err?.message && err.message.includes('slot_unavailable'))) {
                setSlotUnavailable(true);
            } else {
                alert('Errore durante la creazione della prenotazione');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {!paymentPhase && (
                <form className="booking-form" onSubmit={handleInitialSubmit}>
                    <label>
                        Full Name
                        <input
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Phone
                        <div className="booking-form-phone-row">
                            <select
                                className="booking-form-country-code"
                                value={form.countryCode}
                                onChange={handleCodeChange}
                            >
                                {countryCodes.map(opt => (
                                    <option key={opt.code} value={opt.code}>{opt.country} {opt.code}</option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                className="booking-form-phone-input"
                            />
                        </div>
                    </label>
                    <label>
                        Email
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Note importanti
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows={6}
                            className="booking-form-notes"
                        />
                    </label>
                    <button type="submit" className="booking-form-submit" disabled={loading}>
                        {slotUnavailable ? 'Slot non più disponibile' : loading ? 'Inoltro al pagamento...' : 'Paga e Prenota'}
                    </button>
                </form>
            )}

            {paymentPhase && (
                <div className="stripe-container">
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CardPaymentSection
                            clientSecret={clientSecret}
                            form={form}
                            bookingId={bookingId}
                            onDone={(result) => { paymentCompletedRef.current = true; setPaid(true); if (onSubmit) onSubmit({ ...form, bookingId, ...result }); }}
                            date={date}
                            startTime={startTime}
                            endTime={endTime}
                            embark={embark}
                            disembark={disembark}
                            arrangePickup={arrangePickup}
                            arrangeDropoff={arrangeDropoff}
                        />
                    </Elements>
                </div>
            )}
        </div>
    );
}

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#0B232E',
            fontFamily: 'inherit',
            fontSmoothing: 'antialiased',
            '::placeholder': { color: '#9ca3af' },
        },
        invalid: { color: '#e53e3e' },
    },
};

function CardPaymentSection({ clientSecret, form, bookingId, onDone, date = null, startTime = null, endTime = null, embark = null, disembark = null, arrangePickup = false, arrangeDropoff = false }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [cardError, setCardError] = useState(null);
    const [success, setSuccess] = useState(false);

    const amountDisplay = ((form.amountCents || 0) / 100).toFixed(2);

    async function handleConfirm() {
        if (!stripe || !elements || !clientSecret) return;
        setLoading(true);
        setCardError(null);
        const cardElement = elements.getElement(CardElement);
        const confirm = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement, billing_details: { name: form.fullName, email: form.email } }
        });
        setLoading(false);
        if (confirm.error) {
            setCardError(confirm.error.message);
        } else if (confirm.paymentIntent && confirm.paymentIntent.status === 'succeeded') {
            setSuccess(true);
            if (onDone) onDone({ success: true, bookingId });
        }
    }

    if (success) {
        return (
            <div className="checkout-panel">
                <div className="checkout-success">
                    <div className="checkout-success-icon">✓</div>
                    <h3 className="checkout-success-title">Pagamento confermato!</h3>
                    <p className="checkout-success-sub">La tua prenotazione è stata creata con successo.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-panel">
            <h2 className="checkout-heading">Riepilogo e pagamento</h2>

            <div className="checkout-summary">
                <div className="checkout-summary-row">
                    <span className="checkout-label">Nome</span>
                    <span className="checkout-value">{form.fullName}</span>
                </div>
                <div className="checkout-summary-row">
                    <span className="checkout-label">Email</span>
                    <span className="checkout-value">{form.email}</span>
                </div>
                {form.phone && (
                    <div className="checkout-summary-row">
                        <span className="checkout-label">Telefono</span>
                        <span className="checkout-value">{form.countryCode} {form.phone}</span>
                    </div>
                )}

                <div className="checkout-summary-row">
                    <span className="checkout-label">Data e ora</span>
                    <span className="checkout-value">{date ? `${date}${startTime ? ` ${startTime}${endTime ? ` - ${endTime}` : ''}` : ''}` : '*Seleziona data'}</span>
                </div>

                <div className="checkout-summary-row">
                    <span className="checkout-label">Porto</span>
                    <span className="checkout-value">
                        {embark ? `${embark}${arrangePickup ? ' (taxi)' : ''}` : '*N/D'}
                        {' \u2192 '}
                        {disembark ? `${disembark}${arrangeDropoff ? ' (taxi)' : ''}` : '*N/D'}
                    </span>
                </div>

                <div className="checkout-divider" />
                <div className="checkout-summary-row checkout-total-row">
                    <span className="checkout-total-label">Totale</span>
                    <span className="checkout-total-amount">€{amountDisplay}</span>
                </div>
            </div>

            <div className="checkout-card-section">
                <div className="checkout-card-header">
                    <span className="checkout-card-label-text">Dati carta</span>
                    <div className="checkout-card-badges">
                        <span className="checkout-card-badge">VISA</span>
                        <span className="checkout-card-badge">MC</span>
                        <span className="checkout-card-badge">AMEX</span>
                    </div>
                </div>
                <div className="checkout-card-element">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
                {cardError && (
                    <p className="checkout-error">
                        <span>⚠</span> {cardError}
                    </p>
                )}
            </div>

            <button
                className="checkout-pay-btn"
                onClick={handleConfirm}
                disabled={loading || !stripe}
            >
                {loading ? (
                    <span className="checkout-btn-loading">
                        <span className="checkout-spinner" />
                        Elaborazione pagamento…
                    </span>
                ) : (
                    <>
                        Paga €{amountDisplay}
                    </>
                )}
            </button>

            <p className="checkout-secure-note">
                Pagamento sicuro · Crittografia SSL 256-bit · Powered by Stripe
            </p>
        </div>
    );
}
