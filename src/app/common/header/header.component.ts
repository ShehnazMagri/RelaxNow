import { NotificationService } from './../../core/services/notification/notification.service';
import { Observable, Subscription } from 'rxjs';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit,
  Inject,
  OnDestroy,
} from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { map, startWith } from 'rxjs/operators';

import { CommonServiceService } from './../../common-service.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { Doctors } from 'src/app/home/home.component';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  isPatient = false;
  page;
  headerTop = false;
  base;
  loggedIn = false;
  userRole = '';
  bellCollapsed = false;
  userSubscription: Subscription;
  notificationSubscription: Subscription;
  message;
  isloginPage = false;
  isEwiPage = false;
  searchDoctor = '';
  keyword = '';
  doctors: any = [];

  constructor(
    @Inject(DOCUMENT) private document,
    private cdr: ChangeDetectorRef,
    public router: Router,
    private user: UserService,
    public commonService: CommonServiceService,
    private notification: NotificationService,
    private http: HttpService
  ) {
    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        const res = event.url.split('/');
        this.base = res[1];

        if (event.url === '/p/questions') {
          this.isEwiPage = true;
        } else {
          this.isEwiPage = false;
        }
        if (
          event.url === '/' ||
          event.url === '/home' ||
          event.url === '/login' ||
          event.url === '/doctor/login' ||
          event.url === '/forgot-password' ||
          event.url === '/forgot-password/d' ||
          event.url === '/Register'
        ) {
          this.isloginPage = true;
        } else {
          this.isloginPage = false;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getDoctors();

    this.userSubscription = this.user.currentUserSubject.subscribe((auth) => {
      if (auth && auth.token) {
        this.loggedIn = !!auth.token;
        this.userRole = auth.result[0].ROLE;
      } else {
        this.loggedIn = false;
      }
    });
    this.notificationSubscription = this.notification.currentMessage.subscribe(
      (message) => {
        if (message) {
          console.log('notification----', message);
        }
      }
    );
  }

  searchForDoctor(): void {
    this.router.navigate(['/p/search-doctor'], {
      queryParams: { search: this.keyword },
    });
  }

  getDoctors() {
    this.doctors = [];
    this.http.postData(ApiUrl.searchPeople, { searchtext: 'Psych' }).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result = resp.data ? resp.data : [];
          result.forEach((element) => {
            this.doctors.push({
              id: element.DOCTOR_ID.toString(),
              name: element.FIRST_NAME,
              //  +
              // ' ' +
              // element.MIDDLE_NAME +
              // ' ' +
              // element.LAST_NAME,
            });
          });
        }
      },
      (error) => console.log(error)
    );
  }
  bell() {
    this.bellCollapsed = !this.bellCollapsed;
  }
  home(): void {
    const isDoctor =
      this.userRole === 'Psychiatrist' || this.userRole === 'Psychologist';
    const isAdmin = this.userRole === 'ADMIN';
    const isCustomer = this.userRole === 'CUSTOMER';
    if (this.loggedIn && isAdmin) {
      this.router.navigate(['/admin']);
    } else if (this.loggedIn && isDoctor) {
      this.router.navigate(['/doctor']);
    } else if (this.loggedIn && isCustomer) {
      this.router.navigate(['/p/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  logout() {
    this.user.logOutUser();
  }

  selectEvent(item) {
    // let filter = this.countries.filter((a) => a.name === item.name);
    this.searchDoctor = item.name;
    this.router.navigate(['/p/search-doctor'], {
      queryParams: { search: item.name },
    });
    // do something with selected item
  }

  onChangeSearch(search: string) {
    this.searchDoctor = search;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocused(e) {
    // do something
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }
}
