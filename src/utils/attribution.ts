/**
 * CONEXA Attribution & UTM Handler
 * Captures, sanitizes and persists UTM marketing parameters across session storage.
 * Free of PII (Personally Identifiable Information).
 */

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_timestamp?: string;
}

const STORAGE_KEY = 'conexa_utm_attribution';

export function captureAndStoreUtms(): UtmParams {
  if (typeof window === 'undefined') return {};

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const existing = getStoredUtms();

    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmContent = urlParams.get('utm_content');
    const utmTerm = urlParams.get('utm_term');

    // Only overwrite if new UTMs are present in current URL
    if (utmSource || utmMedium || utmCampaign || utmContent || utmTerm) {
      const freshParams: UtmParams = {
        utm_source: utmSource || existing.utm_source,
        utm_medium: utmMedium || existing.utm_medium,
        utm_campaign: utmCampaign || existing.utm_campaign,
        utm_content: utmContent || existing.utm_content,
        utm_term: utmTerm || existing.utm_term,
        referrer: document.referrer ? new URL(document.referrer).hostname : existing.referrer,
        landing_timestamp: existing.landing_timestamp || new Date().toISOString()
      };

      // Clean undefined
      const cleanObj: Record<string, string> = {};
      Object.entries(freshParams).forEach(([k, v]) => {
        if (v) cleanObj[k] = v;
      });

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cleanObj));
      return cleanObj;
    }

    return existing;
  } catch (err) {
    console.warn('[CONEXA Attribution] Could not capture UTMs:', err);
    return {};
  }
}

export function getStoredUtms(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
