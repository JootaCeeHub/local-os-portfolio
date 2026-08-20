import ReactGA from 'react-ga4';
import mixpanel from 'mixpanel-browser';

// Configuración de Google Analytics
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Configuración de Mixpanel
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || 'your_mixpanel_token';

// Inicializar analytics
export const initializeAnalytics = () => {
  // Google Analytics
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }

  // Mixpanel
  if (MIXPANEL_TOKEN && MIXPANEL_TOKEN !== 'your_mixpanel_token') {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: import.meta.env.DEV,
      track_pageview: true,
      persistence: 'localStorage'
    });
  }
};

// Trackear página vista
export const trackPageView = (path: string) => {
  // Google Analytics
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.send({ hitType: 'pageview', page: path });
  }

  // Mixpanel
  if (MIXPANEL_TOKEN && MIXPANEL_TOKEN !== 'your_mixpanel_token') {
    mixpanel.track('Page View', {
      page: path,
      timestamp: new Date().toISOString()
    });
  }
};

// Trackear eventos
export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  // Google Analytics
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.event({
      category: properties.category || 'User Interaction',
      action: eventName,
      label: properties.label,
      value: properties.value
    });
  }

  // Mixpanel
  if (MIXPANEL_TOKEN && MIXPANEL_TOKEN !== 'your_mixpanel_token') {
    mixpanel.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      page_url: window.location.href
    });
  }

  // Console log en desarrollo
  if (import.meta.env.DEV) {
    console.log('Analytics Event:', eventName, properties);
  }
};

// Trackear conversiones
export const trackConversion = (conversionType: string, value?: number, currency = 'USD') => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value,
    currency,
    category: 'Conversion'
  });

  // Google Analytics Enhanced Ecommerce
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.gtag('event', 'purchase', {
      transaction_id: `conv_${Date.now()}`,
      value: value,
      currency: currency,
      items: [{
        item_id: conversionType,
        item_name: conversionType,
        category: 'Subscription',
        quantity: 1,
        price: value
      }]
    });
  }
};

// Trackear usuario
export const identifyUser = (userId: string, properties: Record<string, any> = {}) => {
  // Mixpanel
  if (MIXPANEL_TOKEN && MIXPANEL_TOKEN !== 'your_mixpanel_token') {
    mixpanel.identify(userId);
    mixpanel.people.set({
      $email: properties.email,
      $name: properties.name,
      $created: properties.createdAt || new Date().toISOString(),
      ...properties
    });
  }

  // Google Analytics
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.set({ userId });
  }
};

// A/B Testing
export const getABTestVariant = (testName: string, variants: string[]): string => {
  const userId = localStorage.getItem('user_id') || 'anonymous';
  const hash = simpleHash(userId + testName);
  const variantIndex = hash % variants.length;
  
  const variant = variants[variantIndex];
  
  // Trackear asignación de variante
  trackEvent('ab_test_assignment', {
    test_name: testName,
    variant: variant,
    user_id: userId
  });
  
  return variant;
};

// Función hash simple para A/B testing
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Performance monitoring
export const trackPerformance = () => {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        trackEvent('performance_metrics', {
          page_load_time: perfData.loadEventEnd - perfData.navigationStart,
          dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
          first_contentful_paint: getFirstContentfulPaint(),
          largest_contentful_paint: getLargestContentfulPaint()
        });
      }, 0);
    });
  }
};

// Web Vitals
function getFirstContentfulPaint(): number | null {
  const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
  return fcpEntry ? fcpEntry.startTime : null;
}

function getLargestContentfulPaint(): number | null {
  return new Promise((resolve) => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      resolve(lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }) as any;
}

// Error tracking
export const trackError = (error: Error, context?: Record<string, any>) => {
  trackEvent('error', {
    error_message: error.message,
    error_stack: error.stack,
    error_name: error.name,
    ...context,
    category: 'Error'
  });
};

// Feature flag system
export const isFeatureEnabled = (featureName: string): boolean => {
  // En un entorno real, esto se conectaría a un servicio de feature flags
  const features = {
    'new_dashboard': true,
    'beta_features': false,
    'advanced_analytics': true
  };
  
  return features[featureName as keyof typeof features] || false;
};

// Inicializar analytics al cargar
if (typeof window !== 'undefined') {
  initializeAnalytics();
  trackPerformance();
  
  // Error tracking global
  window.addEventListener('error', (event) => {
    trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    trackError(new Error(event.reason), {
      type: 'unhandled_promise_rejection'
    });
  });
}