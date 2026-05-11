// Aggregates per-area translation modules. Each module exports `{ en, ar }`
// whose shape is merged under a single area-namespaced root in i18n
// resources. To add a new area, drop a `<area>.ts` file in this directory
// exporting `{ en: {...}, ar: {...} }` and add it to the imports below.

import student from './student';
import doctor from './doctor';
import admin from './admin';
import shared from './shared';
import authPages from './auth';
import chrome from './chrome';
import publicSite from './public';

type AreaBundle = { en: Record<string, unknown>; ar: Record<string, unknown> };
// NOTE: the auth module is registered under `authPages` (NOT `auth`) to
// avoid colliding with the existing top-level `auth.*` keys in i18n.ts
// (loginTitle, email, password, forgotPassword, …). Page call sites use
// `t('authPages.login.…')` for new keys and `t('auth.…')` for the
// originals — both resolve.
const modules: Record<string, AreaBundle> = {
  student,
  doctor,
  admin,
  shared,
  authPages,
  chrome,
  public: publicSite,
};

export function buildAreaResources() {
  const en: Record<string, unknown> = {};
  const ar: Record<string, unknown> = {};
  for (const [key, mod] of Object.entries(modules)) {
    en[key] = mod.en;
    ar[key] = mod.ar;
  }
  return { en, ar };
}
