// Adicione este código temporariamente no console do navegador NA PRODUÇÃO
// Para debugar o fluxo completo de login

console.log('🔍 INICIANDO DEBUG DO FLUXO DE LOGIN');

// 1. Verificar cookies existentes
console.log('🍪 Cookies atuais:', document.cookie);

// 2. Interceptar requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('📡 Request interceptado:', args[0], args[1]);
  return originalFetch.apply(this, args).then(response => {
    console.log('📥 Response:', response.status, response.url);
    return response;
  });
};

// 3. Monitor de mudanças de URL
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    console.log('🔄 URL mudou:', currentUrl, '->', window.location.href);
    currentUrl = window.location.href;
  }
}, 100);

// 4. Verificar LocalStorage/SessionStorage
console.log('💾 LocalStorage:', localStorage);
console.log('🗂️ SessionStorage:', sessionStorage);

console.log('✅ Debug ativado! Agora faça login e observe os logs...');