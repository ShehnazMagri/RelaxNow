import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonServiceService } from '../common-service.service';

@Component({
  selector: 'app-doctor',
  templateUrl: './b2b.component.html',
  styleUrls: ['./b2b.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DoctorComponent implements OnInit, OnDestroy {
  splitVal;
  url;
  base = 'b2b';
  page = 'Dashboard';
  doctorSidebar: boolean = true;
  routeSubscription: Subscription;
  routeSubscription2: Subscription;

  constructor(
    private router: Router,
    public commonService: CommonServiceService
  ) {
    this.routeSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/b2b/login')) {
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
