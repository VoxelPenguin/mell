import { HttpInterceptorFn } from '@angular/common/http';

export const harperCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  req.headers.set('Authorization', 'Basic ' + btoa('public:public'));

  return next(req);
};
