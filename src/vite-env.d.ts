/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** Correo para ejercer los derechos de hábeas data; aparece en el aviso de privacidad. */
  readonly VITE_CORREO_DATOS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
