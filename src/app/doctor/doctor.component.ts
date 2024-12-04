import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonServiceService } from './../common-service.service';

@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DoctorComponent implements OnInit, OnDestroy {
  splitVal;
  url;
  base = 'Doctor';
  page = 'Dashboard';
  doctorSidebar: boolean = true;
  routeSubscription: Subscription;
  routeSubscription2: Subscription;

  constructor(
    private router: Router,
    public commonService: CommonServiceService
  ) {
    if (router.url === '/doctor/message') {
      this.doctorSidebar = false;
    } else {
      this.doctorSidebar = true;
    }

    this.routeSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/doctor/message' || event.url === '/doctor/login') {
          this.doctorSidebar = false;
        } else {
          this.doctorSidebar = true;
        }
      }
    });
  }

  ngOnInit(): void {
    this.routeSubscription2 = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.splitVal = event.url.split('/');
        this.base = this.splitVal[1];
        this.page = this.splitVal[2];
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.routeSubscription2.unsubscribe();
  }
}
