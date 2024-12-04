import { HttpService } from './../../core/services/http/http.service';
import {
  Component,
  OnInit,
  Inject,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CommonServiceService } from '../../common-service.service';
import { UserService } from 'src/app/core/services/user/user.service';
import * as $ from 'jquery';
import { ApiUrl } from 'src/app/core/apiUrl';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css'],
})
export class SidemenuComponent implements OnInit, OnDestroy, AfterViewInit {
  page = 'dashboard';
  showDropdown = true;
  public bellCollapsed = true;
  public userCollapsed = true;
  userData: any = {};
  userSubscription: Subscription;
  routerSubscription: Subscription;
  userImage = '';
  constructor(
    @Inject(DOCUMENT) private document,
    public router: Router,
    private commonService: CommonServiceService,
    private userService: UserService,
    private http: HttpService
  ) {
    const currentUrl = router.url;
    this.page = currentUrl;

    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.page = event.url;
      }
    });
  }
  ngOnInit(): void {
    this.userSubscription = this.userService.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userData = userData.result[0];
          this.getUserImage();
        }
      }
    );
  }

  ngAfterViewInit() {
    this.loadDynmicallyScript('assets/admin/js/script.js');
  }
  loadDynmicallyScript(js) {
    const script = document.createElement('script');
    script.src = js;
    script.async = false;
    document.head.appendChild(script);
    script.onload = () => this.doSomethingWhenScriptIsLoaded();
  }

  doSomethingWhenScriptIsLoaded() {}

  main() {
    this.commonService.nextmessage('main');
  }
  clickLogout() {
    this.userService.userSignOut();
  }
  bell() {
    this.bellCollapsed = !this.bellCollapsed;
    if (!this.userCollapsed) {
      this.userCollapsed = true;
    }
  }
  user() {
    this.userCollapsed = !this.userCollapsed;
    if (!this.bellCollapsed) {
      this.bellCollapsed = true;
    }
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  getUserImage(): void {
    const params = {
      query: `Call RN_PROFILE_IMAGES_GET(${this.userData.USERID},1)`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params, false).subscribe(
      (resp: any) => {
        if (!!resp && resp.data[0]) {
          debugger;
          this.userImage =
            resp.data[0].result && resp.data[0].result[0]
              ? resp.data[0].result[0].BASE64CONTENT
              : '';
        }
      },
      (error) => console.log(error)
    );
  }
}
