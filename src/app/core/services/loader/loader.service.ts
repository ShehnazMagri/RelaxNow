import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loaderSubject = new BehaviorSubject({ show: false });
  loaderState = this.loaderSubject.asObservable();

  private paymentloaderSubject = new BehaviorSubject({ show: false });
  paymentloaderState = this.paymentloaderSubject.asObservable();

  constructor() {}

  show(): void {
    this.loaderSubject.next({ show: true });
  }

  hide(): void {
    this.loaderSubject.next({ show: false });
  }

  showProcess(): void {
    this.paymentloaderSubject.next({ show: true });
  }

  hideProcess(): void {
    this.paymentloaderSubject.next({ show: false });
  }
}
