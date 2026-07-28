import '../policy.css';
import { getLocale } from '../utils/locale';

export default function Policy({ lang = 'it' }) {
  const dict = getLocale(lang);

  return (
    <div className="policy-container">
        <h1 className="policy-title">{dict.policy.title}</h1>
    </div>
  );
}
