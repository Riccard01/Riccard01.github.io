import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Book from './pages/Book';
import './App.css';
import { DEFAULT_LANG, LOCALES } from './utils/locale';

function getPathSuffix(pathname) {
  const normalized = (pathname || '/').replace(/\/+$/, '') || '/';
  const langMatch = normalized.match(/^\/([a-z]{2})(\/.*)?$/i);
  if (langMatch) return langMatch[2] || '';
  return normalized === '/' ? '' : normalized;
}

function resolveInitialLanguage() {
  const saved = localStorage.getItem('lang');
  if (saved && LOCALES[saved]) return saved;
  const browser = String(navigator.language || '').slice(0, 2).toLowerCase();
  return LOCALES[browser] ? browser : DEFAULT_LANG;
}

function LocalizedPage({ page, onChangeLang }) {
  const { lang } = useParams();
  const safeLang = LOCALES[lang] ? lang : null;

  if (!safeLang) {
    const suffix = page === 'book' ? '/book' : '';
    return <Navigate to={`/${DEFAULT_LANG}${suffix}`} replace />;
  }

  if (page === 'book') {
    return <Book lang={safeLang} setLang={onChangeLang} />;
  }

  return <HomePage lang={safeLang} setLang={onChangeLang} />;
}

function App() {
  const [lang, setLang] = useState(resolveInitialLanguage);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentLang = location.pathname.split('/')[1];
    if (LOCALES[currentLang] && currentLang !== lang) {
      setLang(currentLang);
    }
  }, [location.pathname, lang]);

  const handleChangeLanguage = (nextLang) => {
    if (!LOCALES[nextLang]) return;
    const suffix = getPathSuffix(location.pathname);
    const nextPath = `/${nextLang}${suffix}`;
    setLang(nextLang);
    if (nextPath !== location.pathname) {
      navigate(nextPath);
    }
  };

  useEffect(() => {
    localStorage.setItem('lang', lang);
    const locale = LOCALES[lang] || LOCALES[DEFAULT_LANG];
    document.documentElement.lang = lang;
    document.documentElement.dir = locale?.rtl ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const origin = window.location.origin;
    const suffix = getPathSuffix(location.pathname);
    const head = document.head;

    head.querySelectorAll('link[data-seo-lang="true"]').forEach((node) => node.remove());

    Object.keys(LOCALES).forEach((code) => {
      const alt = document.createElement('link');
      alt.setAttribute('rel', 'alternate');
      alt.setAttribute('hreflang', code);
      alt.setAttribute('href', `${origin}/${code}${suffix}`);
      alt.setAttribute('data-seo-lang', 'true');
      head.appendChild(alt);
    });

    const xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', `${origin}/${DEFAULT_LANG}${suffix}`);
    xDefault.setAttribute('data-seo-lang', 'true');
    head.appendChild(xDefault);

    const canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', `${origin}/${lang}${suffix}`);
    canonical.setAttribute('data-seo-lang', 'true');
    head.appendChild(canonical);
  }, [lang, location.pathname]);

  return (
    <>
      {/* Completely independent blocking screen */}
      {/* <div id="desktop-blocker">
        <div className="blocker-content">
          <h1 className="blocker-title">Mobile view required</h1>
          <p className="blocker-desc">
            For a better and smoother navigation experience, this platform is optimized exclusively for handheld devices.
          </p>
          <span className="blocker-action">Please press F12 to continue.</span>
        </div>
      </div> */}

      <Routes>
        <Route path="/" element={<Navigate to={`/${lang}`} replace />} />
        <Route path="/book" element={<Navigate to={`/${lang}/book`} replace />} />
        <Route path="/:lang" element={<LocalizedPage page="home" onChangeLang={handleChangeLanguage} />} />
        <Route path="/:lang/book" element={<LocalizedPage page="book" onChangeLang={handleChangeLanguage} />} />
        <Route path="*" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />
      </Routes>
    </>
  );
}

export default App;