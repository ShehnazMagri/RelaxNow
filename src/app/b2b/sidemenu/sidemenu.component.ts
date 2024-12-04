import { HttpService } from 'src/app/core/services/http/http.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/core/services/user/user.service';

import { Event, NavigationEnd, Router } from '@angular/router';

import { CommonServiceService } from '../../common-service.service';
import { ApiUrl } from 'src/app/core/apiUrl';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css'],
})
export class SidemenuComponent implements OnInit, OnDestroy {
  peopleId;
  userImage;
  name;
  splitVal;
  base;
  page;
  userFName: '';
  userLName: '';
  role: '';
  prefix: '';
  routerSubscription: Subscription;
  isVisitor = false;
  public cartCount = '0';
  corporateCode = '';
  constructor(
    private router: Router,
    private user: UserService,
    public commonService: CommonServiceService,
    private http: HttpService
  ) {
    const currentUrl = router.url.split('/');
    this.page = currentUrl[2];

    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      console.log('123');
      this.cartCount = localStorage.getItem('cartProduct');
      if (event instanceof NavigationEnd) {
        const splitVal = event.url.split('/');
        this.page = splitVal[2];
      }
    });
  }

  ngOnInit(): void {
    if (this.user.getUserToken) {
      debugger;
      this.userFName = this.user.currentUserValue.result[0].FIRSTNAME;
      this.userLName = this.user.currentUserValue.result[0].LASTNAME;
      this.role = this.user.currentUserValue.result[0].ROLE;
      this.peopleId = this.user.currentUserValue.result[0].USERID;
      this.isVisitor = !!this.user.currentUserValue.result[0].IS_VISITOR;
      this.prefix = this.user.currentUserValue.result[0].Prefix;
      this.corporateCode = this.user.currentUserValue.result[0].CORPORATECODE;
      this.getUserImage();
    }
  }

  getUserImage(): void {
    const params = {
      query: `Call RN_PROFILE_IMAGES_GET(${this.peopleId},2)`,
      params: '',
    };
    this.executeRequest(params, 'userimage');
  }

  executeRequest(params: any, type: string = '', loader: boolean = true): void {
    this.http.postData(ApiUrl.common, params, loader).subscribe(
      (resp: any) => {
        if (!!resp && resp.data[0]) {
          this.userImage =
            resp.data[0].result && resp.data[0].result[0]
              ? resp.data[0].result[0].BASE64CONTENT
              : '';
        }
      },
      (error) => console.log(error)
    );
  }

  logout() {
    this.user.userSignOut();
  }

  navigate(name) {
    this.name = name;
    this.commonService.nextmessage(name);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
