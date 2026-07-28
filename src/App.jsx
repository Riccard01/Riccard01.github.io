import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './App.css';
import { DEFAULT_LANG, getLocale, LOCALES } from './utils/locale';

const Book = lazy(() => import('./pages/Book'));

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
    return (
      <Suspense fallback={null}>
        <Book lang={safeLang} setLang={onChangeLang} />
      </Suspense>
    );
  }

  return <HomePage lang={safeLang} setLang={onChangeLang} />;
}

function LegacyPolicyRedirect() {
  const { lang } = useParams();
  const safeLang = LOCALES[lang] ? lang : DEFAULT_LANG;
  return <Navigate to={`/${safeLang}`} replace />;
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
    const locale = getLocale(lang);
    const pageKey = suffix === '/book' ? 'book' : 'home';
    const seo = locale?.seo?.[pageKey] || getLocale(DEFAULT_LANG)?.seo?.[pageKey] || {};
    const title = seo.title || 'Leggero Tours';
    const description = seo.description || 'Private boat tours in Liguria between Genoa, Portofino and the Two Gulfs.';
    const currentUrl = `${origin}/${lang}${suffix}`;
    const localeCode = (locale?.localeCode || 'en_US').replace('-', '_');

    const upsertMeta = (selector, attrs) => {
      let node = head.querySelector(selector);
      if (!node) {
        node = document.createElement('meta');
        head.appendChild(node);
      }
      Object.entries(attrs).forEach(([key, value]) => {
        node.setAttribute(key, value);
      });
      return node;
    };

    document.title = title;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Leggero Tours' });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: localeCode });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: currentUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: `${origin}/apple-touch-icon.png` });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: `${origin}/apple-touch-icon.png` });

    head.querySelectorAll('link[data-seo-lang="true"]').forEach((node) => node.remove());
    head.querySelectorAll('script[data-seo-schema="true"]').forEach((node) => node.remove());

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
    canonical.setAttribute('href', currentUrl);
    canonical.setAttribute('data-seo-lang', 'true');
    head.appendChild(canonical);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: title,
      description,
      url: currentUrl,
      provider: {
        '@type': 'Organization',
        name: 'Leggero Tours',
        url: origin,
      },
      inLanguage: lang,
      areaServed: ['Genova', 'Portofino', 'Camogli', 'Liguria'],
    };

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.setAttribute('data-seo-schema', 'true');
    schemaScript.text = JSON.stringify(schema);
    head.appendChild(schemaScript);
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
        <Route path="/policy" element={<Navigate to={`/${lang}`} replace />} />
        <Route path="/:lang" element={<LocalizedPage page="home" onChangeLang={handleChangeLanguage} />} />
        <Route path="/:lang/book" element={<LocalizedPage page="book" onChangeLang={handleChangeLanguage} />} />
        <Route path="/:lang/policy" element={<LegacyPolicyRedirect />} />
        <Route path="*" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />
      </Routes>
    </>
  );
}

export default App;