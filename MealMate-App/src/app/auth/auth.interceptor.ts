import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔵 [Interceptor] ==================');
  console.log('🔵 [Interceptor] URL:', req.url);
  console.log('🔵 [Interceptor] Method:', req.method);

  // Lese User-ID direkt aus localStorage
  const userIdString = localStorage.getItem('userId');
  const userId = userIdString ? parseInt(userIdString) : null;

  console.log('🔵 [Interceptor] localStorage userId (raw):', userIdString);
  console.log('🔵 [Interceptor] Parsed userId:', userId);
  console.log('🔵 [Interceptor] Is valid number?', userId && !isNaN(userId));

  // Überspringe Login und Register URLs
  if (req.url.includes('/login') || req.url.includes('/register')) {
    console.log('⏭️ [Interceptor] Login/Register URL - überspringe Header');
    console.log('🔵 [Interceptor] ==================\n');
    return next(req);
  }

  // Füge User-ID Header hinzu wenn vorhanden
  if (userId && !isNaN(userId)) {
    const clonedRequest = req.clone({
      setHeaders: {
        'X-User-Id': userId.toString()
      }
    });
    
    console.log('✅ [Interceptor] Header WIRD hinzugefügt!');
    console.log('✅ [Interceptor] X-User-Id:', userId.toString());
    console.log('✅ [Interceptor] Alle Headers:', clonedRequest.headers.keys());
    console.log('🔵 [Interceptor] ==================\n');
    
    return next(clonedRequest);
  }
  
  console.log('⚠️ [Interceptor] KEINE User-ID - kein Header hinzugefügt');
  console.log('🔵 [Interceptor] ==================\n');
  return next(req);
};