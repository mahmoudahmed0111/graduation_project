/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PUBLIC_UNIVERSITY_SLUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
