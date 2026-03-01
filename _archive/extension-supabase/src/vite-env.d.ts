/// <reference types="vite/client" />
/// <reference types="chrome" />

declare interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_FUNCTION_URL: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
