import React, { useState, useEffect, useRef } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import "./BookingForm.css";
import { getLocale } from '../utils/locale';
import { getBookingUi } from '../locales/bookingUi';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const countryCodes = [
    { code: "+39", country: "🇮🇹" },
    { code: "+33", country: "🇫🇷" },
    { code: "+41", country: "🇨🇭" },
    { code: "+49", country: "🇩🇪" },
    { code: "+44", country: "🇬🇧" },
];

// Step-by-step wizard: collect name → phone → email → notes → pay
const STEPS = ['name', 'phone', 'email', 'notes'];

export default function BookingForm({ lang = 'it', onSubmit, boatId = null, date = null, slotKey = null, startTime = null, endTime = null, captainId = null, secondaryBoatId = null, secondaryCaptainId = null, secondaryBoatName = null, embark = null, disembark = null, arrangePickup = false, arrangeDropoff = false, numPax = 1, amountCents = 0, onSlotUnavailableRetry = null }) {
    const dict = getLocale(lang);
    const t = dict.bookingForm;
    const ui = getBookingUi(lang);

    const [form, setForm] = useState({
        fullName: "",
        countryCode: countryCodes[0].code,
        phone: "",
        email: "",
        notes: "",
        amountCents: amountCents || 0,
    });

    const [stepIndex, setStepIndex] = useState(0);

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

    function stepLabel(step) {
        const labels = {
            name: ui.formName,
            phone: ui.formPhone,
            email: ui.formEmail,
            notes: ui.formNotes,
        };
        return labels[step] || step;
    }

    function stepIsValid(step) {
        if (step === 'name')  return form.fullName.trim().length > 0;
        if (step === 'phone') return form.phone.trim().length > 0;
        if (step === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
        return true; // notes is optional
    }

    function handleNext() {
        if (stepIndex < STEPS.length - 1) {
            setStepIndex(s => s + 1);
        } else {
            handleInitialSubmit();
        }
    }

    async function handleInitialSubmit(e) {
        if (e && e.preventDefault) e.preventDefault();
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
                secondaryBoatId: secondaryBoatId || null,
                secondaryCaptainId: secondaryCaptainId || null,
                secondaryBoatName: secondaryBoatName || null,
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
                alert(t.errorCreatingBooking);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bsf-wrap">
            {!paymentPhase && (
                <>
                    {/* Progress bar */}
                    <div className="bsf-progress-bar" aria-hidden="true">
                        <div
                            className="bsf-progress-fill"
                            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>

                    <div className="bsf-step-counter">
                        {stepIndex + 1}/{STEPS.length}
                    </div>

                    <div className="bsf-step">
                        <h2 className="bsf-step-label">{stepLabel(STEPS[stepIndex])}</h2>

                        {STEPS[stepIndex] === 'name' && (
                            <input
                                className="bsf-input"
                                type="text"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                autoFocus
                                placeholder={t.fullName}
                                autoComplete="name"
                            />
                        )}

                        {STEPS[stepIndex] === 'phone' && (
                            <div className="bsf-phone-row">
                                <select
                                    className="bsf-country-code"
                                    value={form.countryCode}
                                    onChange={handleCodeChange}
                                >
                                    {countryCodes.map(opt => (
                                        <option key={opt.code} value={opt.code}>{opt.country} {opt.code}</option>
                                    ))}
                                </select>
                                <input
                                    className="bsf-input bsf-phone-input"
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    autoFocus
                                    placeholder={t.phone}
                                    autoComplete="tel"
                                />
                            </div>
                        )}

                        {STEPS[stepIndex] === 'email' && (
                            <input
                                className="bsf-input"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                autoFocus
                                placeholder={t.email}
                                autoComplete="email"
                                onKeyDown={e => { if (e.key === 'Enter') handleNext(); }}
                            />
                        )}

                        {STEPS[stepIndex] === 'notes' && (
                            <textarea
                                className="bsf-input bsf-textarea"
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                autoFocus
                                placeholder={ui.optional}
                                rows={4}
                            />
                        )}
                    </div>

                    <div className="bsf-actions">
                        {stepIndex > 0 && (
                            <button
                                type="button"
                                className="bsf-back"
                                onClick={() => setStepIndex(s => s - 1)}
                            >
                                {ui.back}
                            </button>
                        )}
                        <button
                            type="button"
                            className="bsf-continue"
                            disabled={loading || !stepIsValid(STEPS[stepIndex])}
                            onClick={handleNext}
                        >
                            {stepIndex < STEPS.length - 1
                                ? ui.continue
                                : (slotUnavailable ? t.slotUnavailable : loading ? t.processing : t.payAndBook)}
                        </button>
                    </div>
                </>
            )}

            {paymentPhase && (
                <div className="stripe-container">
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CardPaymentSection
                            clientSecret={clientSecret}
                            form={form}
                            bookingId={bookingId}
                            onDone={(result) => { paymentCompletedRef.current = true; setPaid(true); if (onSubmit) onSubmit({ ...form, bookingId, ...result }); }}
                            lang={lang}
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

function CardPaymentSection({ lang = 'it', clientSecret, form, bookingId, onDone, date = null, startTime = null, endTime = null, embark = null, disembark = null, arrangePickup = false, arrangeDropoff = false }) {
    const dict = getLocale(lang);
    const t = dict.bookingForm;

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
                    <h3 className="checkout-success-title">{t.paymentConfirmed}</h3>
                    <p className="checkout-success-sub">{t.bookingCreated}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-panel">
            <h2 className="checkout-heading">{t.summaryPayment}</h2>

            <div className="checkout-summary">
                <div className="checkout-summary-row">
                    <span className="checkout-label">{t.name}</span>
                    <span className="checkout-value">{form.fullName}</span>
                </div>
                <div className="checkout-summary-row">
                    <span className="checkout-label">{t.email}</span>
                    <span className="checkout-value">{form.email}</span>
                </div>
                {form.phone && (
                    <div className="checkout-summary-row">
                        <span className="checkout-label">{t.phone}</span>
                        <span className="checkout-value">{form.countryCode} {form.phone}</span>
                    </div>
                )}

                <div className="checkout-summary-row">
                    <span className="checkout-label">{t.dateTime}</span>
                    <span className="checkout-value">{date ? `${date}${startTime ? ` ${startTime}${endTime ? ` - ${endTime}` : ''}` : ''}` : `*${t.selectDate}`}</span>
                </div>

                <div className="checkout-summary-row">
                    <span className="checkout-label">{t.port}</span>
                    <span className="checkout-value">
                        {embark ? `${embark}${arrangePickup ? ' (taxi)' : ''}` : `*${t.notAvailable}`}
                        {' \u2192 '}
                        {disembark ? `${disembark}${arrangeDropoff ? ' (taxi)' : ''}` : `*${t.notAvailable}`}
                    </span>
                </div>

                <div className="checkout-divider" />
                <div className="checkout-summary-row checkout-total-row">
                    <span className="checkout-total-label">Total</span>
                    <span className="checkout-total-amount">€{amountDisplay}</span>
                </div>
            </div>

            <div className="checkout-card-section">
                <div className="checkout-card-header">
                    <span className="checkout-card-label-text">{t.cardDetails}</span>
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
                        {t.processing}
                    </span>
                ) : (
                    <>
                        Pay €{amountDisplay}
                    </>
                )}
            </button>

            <p className="checkout-secure-note">
                {t.secureNote}
            </p>
        </div>
    );
}
