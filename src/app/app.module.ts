import {NgModule} from "@angular/core";
import {IonicApp, IonicModule} from "ionic-angular";
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {IonicStorageModule} from '@ionic/storage';
import { TranslateModule } from '@ngx-translate/core';


import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {ActivityService} from "../services/activity-service";
import {TripService} from "../services/trip-service";
import {WeatherProvider} from "../services/weather";

import {MyApp} from "./app.component";

import {SettingsPage} from "../pages/settings/settings";
import {CheckoutTripPage} from "../pages/checkout-trip/checkout-trip";
import {HomePage} from "../pages/home/home";
import {LoginPage} from "../pages/login/login";
import {NotificationsPage} from "../pages/notifications/notifications";
import {RegisterPage} from "../pages/register/register";
import {SearchLocationPage} from "../pages/search-location/search-location";
import {TripDetailPage} from "../pages/trip-detail/trip-detail";
import {TripsPage} from "../pages/trips/trips";
import {LocalWeatherPage} from "../pages/local-weather/local-weather";
import {AuthenticationService} from "../services/authentication.service";

import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {EndpointService} from "../services/endpoint.service";
import {LogService} from "../services/log.service";
import {JwtTokenInterceptor} from "../_helpers/jwt.interceptor";
import {UnauthorizedInterceptor} from "../_helpers/error.interceptor";
import {TranslateLoader} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {HttpClient} from "@angular/common/http";
import {ConnectionStatusService} from "../services/connection-status-service";
import {DeviceInfo} from "../models/information/device-info.model";
import {Device} from "@ionic-native/device";
import {Pro} from "@ionic/pro";
import {DeviceInfoService} from "../services/device-info.service";
import {IonicDeploy} from "../services/ionic-deploy.service";
import {Diagnostic} from "@ionic-native/diagnostic";
import {BatteryStatus} from "@ionic-native/battery-status";
import {Sim} from "@ionic-native/sim";
import {Network} from "@ionic-native/network";
import {IsDebug} from "@ionic-native/is-debug";
import {AppVersion} from "@ionic-native/app-version";

// import services
// end import services
// end import services

// import pages
// end import pages

@NgModule({
  declarations: [
    MyApp,
    SettingsPage,
    CheckoutTripPage,
    HomePage,
    LoginPage,
    LocalWeatherPage,
    NotificationsPage,
    RegisterPage,
    SearchLocationPage,
    TripDetailPage,
    TripsPage,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp, {
      scrollPadding: false,
      scrollAssist: true,
      autoFocusAssist: false
    }),
    IonicStorageModule.forRoot({
      name: '__ionic3_start_theme',
        driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SettingsPage,
    CheckoutTripPage,
    HomePage,
    LoginPage,
    LocalWeatherPage,
    NotificationsPage,
    RegisterPage,
    SearchLocationPage,
    TripDetailPage,
    TripsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ConnectionStatusService,
    ActivityService,
    TripService,
    WeatherProvider,
    AuthenticationService,
    EndpointService,
    LogService,
    DeviceInfo,
    DeviceInfoService,
    IonicDeploy,
    Diagnostic,
    BatteryStatus,
    Sim,
    Network,
    IsDebug,
    AppVersion,
    Device,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtTokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorizedInterceptor,
      multi: true
    },
  ]
})

export class AppModule {
}

export namespace Global {
  export var IonicPro: any = Pro.init('618826dd');
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
