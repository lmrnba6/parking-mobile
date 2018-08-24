import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable, Injector} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {App} from "ionic-angular";
import {LoginPage} from "../pages/login/login";
import {LogService} from "../services/log.service";
import {EndpointService} from "../services/endpoint.service";
import 'rxjs/add/operator/do';



@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {

  constructor(private injector: Injector) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let endpointService = this.injector.get(EndpointService);
    let logService = this.injector.get(LogService);
    return next.handle(req).do(evt => {
    }, errorResponse => {
      if (errorResponse instanceof HttpErrorResponse) {
        logService.error('HTTP request failed with error : ', errorResponse);
        if (errorResponse.status === 401 && req.url.startsWith(endpointService.currentEndpoint)) {
          // let navCtrl: NavController = this.injector.get(NavController);
          let app: any = this.injector.get(App);
          app.getRootNavs()[0].setRoot(LoginPage);
        }
      }
    });
  }
}
