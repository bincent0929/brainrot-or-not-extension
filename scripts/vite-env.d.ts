/// <reference types="vite/client" />
declare module "*.css" {}   // ← this is what makes CSS imports valid

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
