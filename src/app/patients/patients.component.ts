import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Event, Router, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { MessageService } from '../core/services/message/message.service';
import { UserService } from '../core/services/user/user.service';

import { CommonServiceService } from './../common-service.service';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
})
export class PatientsComponent implements OnInit, OnDestroy {
  splitVal;
  base = 'Patients';
  page = 'Dashboard';
  patientSidebar: boolean = false;
  routerSubscription: Subscription;
  userActivity;
  userInactive: Subject<any> = new Subject();
  constructor(
    private router: Router,
    public commonService: CommonServiceService,
    private user: UserService,
    private msg: MessageService
  ) {
    debugger;
    if (
      router.url === '/p/dashboard' ||
      router.url === '/p/favourites' ||
      router.url === '/p/reviews' ||
      router.url === '/p/appointments' ||
      router.url === '/p/billing' ||
      router.url === '/p/appointment-list' ||
      router.url === '/p/change-password' ||
      router.url.includes('/p/appointment-details') ||
      router.url === '/p/settings' ||
      router.url.includes('/p/services') ||
      router.url.includes('/p/product-desc') ||
      router.url.includes('/p/my-purchase') ||
      router.url.includes('/p/cart') ||
      router.url.includes('/p/checkout')
    ) {
      this.patientSidebar = true;
    } else {
      this.patientSidebar = false;
    }
    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (
          event.url === '/p/dashboard' ||
          event.url === '/p/favourites' ||
          router.url === '/p/change-password' ||
          router.url === '/p/reviews' ||
          router.url === '/p/appointments' ||
          router.url === '/p/billing' ||
          router.url === '/p/appointment-list' ||
          event.url.includes('/p/appointment-details') ||
          event.url === '/p/settings' ||
          router.url.includes('/p/services') ||
          router.url.includes('/p/product-desc') ||
          router.url.includes('/p/my-purchase') ||
          router.url.includes('/p/cart') ||
          router.url.includes('/p/checkout')
        ) {
          this.patientSidebar = true;
        } else {
          this.patientSidebar = false;
        }
        this.splitVal = event.url.split('/');
        this.base = this.splitVal[1];
        this.page = this.splitVal[2];
      }
    });
  }

  ngOnInit(): void {
    // this.setTimeout();
    // this.userInactive.subscribe(() => {
    //   if (this.router.url.includes('/p/chat-portal')) {
    //     console.log('Not exists');
    //   } else {
    //     this.msg.showError('Session expired');
    //     this.user.logOutUser();
    //   }
    // });
  }

  //@HostListener('window:beforeunload')
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    // this.user.logOutUser();
  }

  setTimeout() {
    this.userActivity = setTimeout(
      () => this.userInactive.next(undefined),
      180000
    );
  }

  @HostListener('window:mousemove') refreshUserState() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }
}
