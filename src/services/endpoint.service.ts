import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {LogService} from "./log.service";

export const endpoints = {
  'production': '',
  'local': 'http://localhost:8080',
};


@Injectable()
export class EndpointService {

  private endpointBehaviorSubject: BehaviorSubject<String> = new BehaviorSubject(endpoints.production);
  public observableEndpoint: Observable<String> = this.endpointBehaviorSubject.asObservable();
  private _currentEndpoint = endpoints.local;
  constructor(private log: LogService) {
  }

  init() {
    this.currentEndpoint = this._currentEndpoint;
  }


  get currentEndpoint() {
    return this._currentEndpoint;
  }

  set currentEndpoint(endpoint: string) {
    if (endpoint.endsWith('/')) {
      endpoint = endpoint.substr(0, endpoint.length - 1);
    }
    //localStorage.setItem(EndpointService.ENDPOINT_STORAGE_KEY, endpoint)
    this._currentEndpoint = endpoint;
    this.endpointBehaviorSubject.next(this._currentEndpoint);
  }

  setEndpointToProduction() {
    this.currentEndpoint = endpoints['production'];
  }

  setEndpointToLocal() {
    this.currentEndpoint = endpoints['local'];
  }

}
