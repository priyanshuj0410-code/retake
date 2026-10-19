/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_STORE?: 'local' | 'emulator' | 'firebase'
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_DATABASE_URL: string
}
