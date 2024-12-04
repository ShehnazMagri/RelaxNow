import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MessageService } from '../services/message/message.service';
import { UserService } from '../services/user/user.service';
import { LoaderService } from '../services/loader/loader.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private message: MessageService,
    private user: UserService,
    private loader: LoaderService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(
        (event) => {
          if (event instanceof HttpResponse) {
            switch (event.body.status) {
              case 401:
                /********** Auto logout if 401 response returned from api **********/
                this.loader.hide();
                this.message.showError(
                  'Sorry, your account has been logged in other device! Please login again to continue.'
                );
                this.user.userSignOut();
                break;
              case 0:
                /********** If server dosent respond **********/
                this.loader.hide();
                this.message.showError('No network connection.');
                break;
              case 400:
                this.loader.hide();
                this.message.showError('Invalid Username/Password.');
                this.user.userSignOut();
                break;
              case 500:
              case 8:
              case 404:
                /********** Check for other serve-side errors **********/
                this.loader.hide();
                this.message.showError(event.body.message);
                break;
            }
          }
        },
        (error) => {
          this.loader.hide();
          switch (error.status) {
            case 401:
              /********** Auto logout if 401 response returned from api **********/
              this.message.showError(
                'Sorry, your account has been logged in other device! Please login again to continue.'
              );
              this.user.userSignOut();
              break;
            case 503:
              /********** service unavailable **********/
              this.message.showError('Service Unavailable, Server Error.');
              break;
            case 0:
              /********** If server dosent respond **********/
              this.message.showError('No network connection.');
              break;
            default:
              /********** Check for other serve-side errors **********/
              if (!!error.error) {
                this.message.showError(error.statusText);
              }
              break;
          }
        }
      )
    );
  }
}
