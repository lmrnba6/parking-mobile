import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable, Injector} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {EndpointService} from "../services/endpoint.service";


@Injectable()
export class JwtTokenInterceptor implements HttpInterceptor {

  constructor(private injector: Injector) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let endpointService = this.injector.get(EndpointService);
    if (req.url.startsWith(endpointService.currentEndpoint) && (req.url.includes('/mobile/v2') || req.url.includes('/file/') || req.url.includes('/oauth/token'))) {
      let token = localStorage.getItem('AUTH_TOKEN');
      if (token) {
        return next.handle(req.clone({headers: req.headers.set('Authorization', `Bearer ${token}`)}));
      } else {
        return next.handle(req);
      }
    } else {
      return next.handle(req);
    }
  }
}
