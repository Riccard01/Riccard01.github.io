import './policy.css';
import { getLocale } from '../utils/locale';

export default function Policy({ lang = 'it' }) {
  const dict = getLocale(lang);

  return (
    <main className="policy-container">
        <h1 className="policy-title">{dict.policy.title}</h1>
        <p className="policy-text">{dict.policy.description || 'Read our policy, cancellation conditions and legal terms for private boat tours.'}</p>
    </main>
  );
}
