import { HttpInterceptorFn } from '@angular/common/http';

export const harperCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const reqWithHeader = req.clone({
    headers: req.headers.set(
      'Authorization',
      'Basic ' + btoa('public:public123'),
    ),
  });

  return next(reqWithHeader);
};
