import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoaderService } from '../loader/loader.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private loader: LoaderService
  ) { }

  /******************** HTTP Requests ********************/
  getData(url: string, params?: { [x: string]: any; }): Observable<any> {
    const _params = params ? { params: this.appendParams(params) } : {};
    this.loader.show();
    return this.http.get<any>(environment.BASE_URL + url, _params)
      .pipe(
        map((response: any) => {
          this.loader.hide();
          if (response['status'] === 200) {
            return response;
          }
        })
      );
  }

  postData(url: string, data: { [x: string]: any; }, loader: boolean = true): Observable<any> {
    if (loader) { this.loader.show(); }
    return this.http.post<HttpClient>(environment.BASE_URL + url, data)
      .pipe(
        map((response: any) => {
          this.loader.hide();

          if (response['status'] === 200) {
            return response;
          }
        })
      );
  }

  putData(url: string, data: { [x: string]: any; }): Observable<any> {
    this.loader.show();
    return this.http.put<HttpClient>(environment.BASE_URL + url, data)
      .pipe(
        map((response: any) => {
          this.loader.hide();

          if (response['status'] === 200) { return response; }
        })
      );
  }

  deleteData(url: string, id: string): Observable<any> {
    this.loader.show();
    return this.http.delete<HttpClient>(environment.BASE_URL + url + '/' + id)
      .pipe(
        map((response: any) => {
          this.loader.hide();

          if (response['status'] === 200) { return response; }
        })
      );
  }

  /******************** HTTP Formdata ********************/
  appendFormData(myFormData: { [x: string]: any; }): FormData {
    const fd = new FormData();
    for (let key in myFormData) {
      fd.append(key, myFormData[key]);
    }
    return fd;
  }

  /******************** HTTP Params ********************/
  appendParams(myParams: { [x: string]: any; }): HttpParams {
    let params = new HttpParams();
    for (let key in myParams) {
      params = params.append(key, myParams[key]);
    }
    return params;
  }
}
