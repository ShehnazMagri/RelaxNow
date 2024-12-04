import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from '../services/user/user.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

	constructor(
		private user: UserService
	) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

		/********** Add Authroziation token in Request header if available **********/
		let token = this.user.getUserToken || '';
		let headers = {};
		if (token) headers['token'] = token;
		headers['Content-Type'] = 'application/json';
		request = request.clone({
			setHeaders: headers
		});

		return next.handle(request);
	}
}