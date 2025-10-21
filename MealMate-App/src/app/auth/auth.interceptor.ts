import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔍 Interceptor - URL:', req.url);

  const userIdString = localStorage.getItem('userId');
  const userId = userIdString ? parseInt(userIdString) : null;

  console.log('🔍 Interceptor - User-ID aus localStorage:', userId);

  // Füge User-ID zu allen Requests hinzu (außer Login/Register)
  if (userId && !req.url.includes('/login') && !req.url.includes('/register')) {
    const clonedRequest = req.clone({
      setHeaders: {
        'X-User-Id': userId.toString()
      }
    });
    console.log('✅ Header hinzugefügt - X-User-Id:', clonedRequest.headers.get('X-User-Id'));
    return next(clonedRequest);
  }
  
  console.log('⚠️ Kein Header hinzugefügt (kein Login oder Login/Register URL)');
  return next(req);
};