import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. שליפת הטוקן מה-LocalStorage
  const token = localStorage.getItem('auth_token');

  // 2. אם יש טוקן, "משכפלים" את הבקשה ומוסיפים לה את ה-Header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // 3. אם אין טוקן, ממשיכים כרגיל)
  return next(req);
};