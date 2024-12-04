import { MessageService } from './../../core/services/message/message.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { UserService } from 'src/app/core/services/user/user.service';

import { CommonServiceService } from './../../common-service.service';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css'],
})
export class SidemenuComponent implements OnInit, OnDestroy {
  name;
  userData: any = {};
  userSubscription: Subscription;
  routerSubscription: Subscription;
  peopleId = 0;
  showAssesment = true;
  userImage = '';
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'user';
  cartCount = '0';
  constructor(
    private router: Router,
    public commonService: CommonServiceService,
    private http: HttpService,
    private message: MessageService,
    private user: UserService
  ) {
    const currentUrl = router.url.split('/');
    this.name = currentUrl[2];

    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      console.log('123');
      this.cartCount = localStorage.getItem('cartProduct');
      if (event instanceof NavigationEnd) {
        const splitVal = event.url.split('/');
        this.name = splitVal[2];
      }
    });
  }

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.peopleId = userData.result[0].USERID;
          this.userData = userData.result[0];
          if (
            userData.result[0].CORPORATECODE != null &&
            userData.result[0].CORPORATECODE != ''
          ) {
            //
            this.showAssesment = false;
          }
        }
      }
    );
    if (this.peopleId) {
      this.getUserImage();
    }
  }

  /*** Get User Image ***/
  getUserImage(): void {
    const params = {
      query: `Call RN_PROFILE_IMAGES_GET(${this.peopleId},2)`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params, false).subscribe(
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
  /********* User Sign-Out **********/
  logout() {
    this.user.userSignOut();
  }

  /********** On selection of image insert the value in form **********/
  onImageSelect(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const parts = file.name.split('.');
      if (file.size / 1024 / 1024 < 5) {
        if (['jpg', 'jpeg', 'png'].includes(parts[parts.length - 1])) {
          const reader: FileReader = new FileReader();
          reader.readAsDataURL(event.target.files[0]);
          reader.onload = (e: any) => {
            this.userImage = e.target.result;
            this.uploadImage();
          };
        } else {
          this.message.showError('Invalid File Type');
        }
      } else {
        this.message.showError('Image Size Should Be Less Than 5 Mb');
      }
    }
  }

  /*** Upload Image ***/
  uploadImage(): void {
    const x = Math.floor(Math.random() * 10000 + 1);
    const params = {
      query: `Call RN_PROFILE_IMAGES_UPSERT(${this.peopleId},2,'${this.userImage}','customer_imag${x}','${this.modifiedBy}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          console.log(resp);
        }
      },
      (error) => console.log(error)
    );
  }

  navigate(name) {
    this.name = name;
    this.commonService.nextmessage(name);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
