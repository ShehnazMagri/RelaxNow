import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import {
  Event,
  NavigationStart,
  Router,
  ActivatedRoute,
  NavigationEnd,
} from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { CommonServiceService } from '../common-service.service';

@Component({
  selector: 'app-reception',
  templateUrl: './reception.component.html',
  styleUrls: ['./reception.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ReceptionComponent implements OnInit {
  adminShow = true;
  constructor(
    @Inject(DOCUMENT) private document,
    public commonService: CommonServiceService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (
          event.url === '/admin/forgot-pass' ||
          event.url === '/admin/lock-screen' ||
          event.url === '/admin/login' ||
          event.url === '/admin/register' ||
          event.url === '/admin/error-first' ||
          event.url === '/admin/error-second'
        ) {
          this.adminShow = false;
        } else {
          this.adminShow = true;
        }
      }
    });
  }
  ngOnInit(): void {
    this.commonService.nextmessage('admin');
  }
}
