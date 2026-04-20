/**
 * API Configuration
 * 
 * Mengatur mode penggunaan API:
 * - VITE_USE_MOCKS=true: Menggunakan mock data (untuk development tanpa backend)
 * - VITE_USE_MOCKS=false: Menggunakan API asli melalui proxy
 * 
 * Untuk switch mode, ubah nilai VITE_USE_MOCKS di file .env
 */

export const API_CONFIG = {
  // Mode mock: true = gunakan mock data, false = gunakan API asli
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true' || import.meta.env.VITE_USE_MOCKS === true,
  
  // Base URL untuk API asli (jika tidak menggunakan mock)
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api-fintracker.suissetiawan.my.id',
  
  // Timeout untuk request
  TIMEOUT: 10000,
}

// Logging untuk development
if (import.meta.env.DEV) {
  console.log(`[API Config] Mode: ${API_CONFIG.USE_MOCKS ? 'MOCK DATA' : 'REAL API'}`)
  console.log(`[API Config] Base URL: ${API_CONFIG.BASE_URL}`)
}
