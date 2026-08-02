import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './App.css';
import { DEFAULT_LANG, getLocale, LOCALES } from './utils/locale';
import { getExperienceIdFromSlug, getExperienceSlugById } from './utils/experienceRoutes';
import { getSeoUi } from './locales/seoUi';

const Book = lazy(() => import('./pages/Book'));
const ExperienceDetailPage = lazy(() => import('./pages/ExperienceDetailPage'));

function getPathSuffix(pathname) {
  const normalized = (pathname || '/').replace(/\/+$/, '') || '/';
  const langMatch = normalized.match(/^\/([a-z]{2})(\/.*)?$/i);
  if (langMatch) return langMatch[2] || '';
  return normalized === '/' ? '' : normalized;
}

function getLocalizedSuffix(suffix, lang) {
  const experienceMatch = suffix.match(/^\/(esperienze|experiences)\/([^/]+)$/i);
  const experienceId = experienceMatch ? getExperienceIdFromSlug(experienceMatch[2]) : null;
  if (!experienceId) return suffix;

  const prefix = lang === 'it' ? 'esperienze' : 'experiences';
  return `/${prefix}/${getExperienceSlugById(experienceId)}`;
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

  if (page === 'experience') {
    return (
      <Suspense fallback={null}>
        <ExperienceDetailPage lang={safeLang} setLang={onChangeLang} />
      </Suspense>
    );
  }

  return <HomePage lang={safeLang} setLang={onChangeLang} />;
}

function LegacyPolicyRedirect() {
  const { lang } = useParams();
  const safeLang = LOCALES[lang] ? lang : DEFAULT_LANG;
  return <Navigate to={`/${safeLang}#faq`} replace />;
}

function App() {
  const [lang, setLang] = useState(resolveInitialLanguage);
  const location = useLocation();
  const navigate = useNavigate();
  const pathLang = location.pathname.split('/')[1];
  const activeLang = LOCALES[pathLang] ? pathLang : lang;

  const handleChangeLanguage = (nextLang) => {
    if (!LOCALES[nextLang]) return;
    const suffix = getLocalizedSuffix(getPathSuffix(location.pathname), nextLang);
    const nextPath = `/${nextLang}${suffix}`;
    setLang(nextLang);
    if (nextPath !== location.pathname) {
      navigate(nextPath);
    }
  };

  useEffect(() => {
    localStorage.setItem('lang', activeLang);
    const locale = LOCALES[activeLang] || LOCALES[DEFAULT_LANG];
    document.documentElement.lang = activeLang;
    document.documentElement.dir = locale?.rtl ? 'rtl' : 'ltr';
  }, [activeLang]);

  useEffect(() => {
    const origin = window.location.origin;
    const routeSuffix = getPathSuffix(location.pathname);
    const head = document.head;
    const locale = getLocale(activeLang);
    const experienceMatch = routeSuffix.match(/^\/(esperienze|experiences)\/([^/]+)$/i);
    const resolvedExperienceId = experienceMatch ? getExperienceIdFromSlug(experienceMatch[2]) : null;
    const experience = resolvedExperienceId
      ? (locale?.experienceCarousel?.experiences || []).find((item) => item.id === resolvedExperienceId)
      : null;

    const pageKey = routeSuffix === '/book' ? 'book' : (experience ? 'experience' : 'home');
    const seo = getSeoUi(activeLang, pageKey);
    const title = experience
      ? `${experience.title} | Leggero Tours`
      : (seo.title || 'Leggero Tours');
    const description = experience
      ? experience.desc
      : (seo.description || 'Private boat tours in Liguria between Genoa, Portofino and the Two Gulfs.');
    const canonicalSuffix = getLocalizedSuffix(routeSuffix, activeLang);
    const currentUrl = `${origin}/${activeLang}${canonicalSuffix}`;
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
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: pageKey === 'book'
        ? 'noindex,follow'
        : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
    });
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

    if (pageKey !== 'book') {
      Object.keys(LOCALES).forEach((code) => {
        const alt = document.createElement('link');
        alt.setAttribute('rel', 'alternate');
        alt.setAttribute('hreflang', code);
        alt.setAttribute('href', `${origin}/${code}${getLocalizedSuffix(routeSuffix, code)}`);
        alt.setAttribute('data-seo-lang', 'true');
        head.appendChild(alt);
      });

      const xDefault = document.createElement('link');
      xDefault.setAttribute('rel', 'alternate');
      xDefault.setAttribute('hreflang', 'x-default');
      xDefault.setAttribute('href', `${origin}/${DEFAULT_LANG}${getLocalizedSuffix(routeSuffix, DEFAULT_LANG)}`);
      xDefault.setAttribute('data-seo-lang', 'true');
      head.appendChild(xDefault);
    }

    const canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', currentUrl);
    canonical.setAttribute('data-seo-lang', 'true');
    head.appendChild(canonical);

    const organizationId = `${origin}/#organization`;
    const schemaGraph = [{
      '@type': 'Organization',
      '@id': organizationId,
      name: 'Leggero Tours',
      url: origin,
      logo: `${origin}/apple-touch-icon.png`,
      email: 'riccardo@leggerotours.com',
      telephone: '+39 346 336 5699',
      areaServed: ['Genova', 'Golfo Paradiso', 'Golfo del Tigullio', 'Camogli', 'San Fruttuoso', 'Portofino'],
      availableLanguage: Object.keys(LOCALES),
    }];

    if (pageKey === 'home') {
      const faqItems = Array.isArray(locale?.faq?.items) ? locale.faq.items : [];
      if (faqItems.length) {
        schemaGraph.push({
          '@type': 'FAQPage',
          '@id': `${currentUrl}#faq`,
          inLanguage: locale?.localeCode || activeLang,
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        });
      }
    }

    if (experience) {
      schemaGraph.push({
        '@type': 'TouristTrip',
        '@id': `${currentUrl}#tour`,
        name: experience.title,
        description,
        url: currentUrl,
        provider: { '@id': organizationId },
        inLanguage: locale?.localeCode || activeLang,
        areaServed: ['Genova', 'Golfo Paradiso', 'Golfo del Tigullio', 'Camogli', 'San Fruttuoso', 'Portofino'],
      });
    }

    const schema = {
      '@context': 'https://schema.org',
      '@graph': schemaGraph,
    };

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.setAttribute('data-seo-schema', 'true');
    schemaScript.text = JSON.stringify(schema);
    head.appendChild(schemaScript);
  }, [activeLang, location.pathname]);

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
        <Route path="/policy" element={<Navigate to={`/${lang}#faq`} replace />} />
        <Route path="/:lang" element={<LocalizedPage page="home" onChangeLang={handleChangeLanguage} />} />
        <Route path="/:lang/book" element={<LocalizedPage page="book" onChangeLang={handleChangeLanguage} />} />
        <Route path="/:lang/esperienze/:experienceId" element={<LocalizedPage page="experience" onChangeLang={handleChangeLanguage} />} />
        <Route path="/:lang/experiences/:experienceId" element={<LocalizedPage page="experience" onChangeLang={handleChangeLanguage} />} />
        <Route path="/:lang/policy" element={<LegacyPolicyRedirect />} />
        <Route path="*" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />
      </Routes>
    </>
  );
}

export default App;