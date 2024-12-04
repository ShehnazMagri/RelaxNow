import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';
const now = new Date();

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  isSubmitted = false;
  userSubscription: Subscription;
  peopleId = 0;
  userImage = '';

  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'user';
  userData;
  allUserData;
  maritalStatusData = [];

  birthDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  maxDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  countryData = [];
  incomeData = [];
  constructor(
    private http: HttpService,
    private message: MessageService,
    private user: UserService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          debugger;
          this.peopleId = userData.result[0].USERID;
          // this.userData = userData.result[0];
          this.allUserData = userData;
          this.getUserDetailsById();
        }
      }
    );
    if (this.peopleId) {
      this.getUserImage();
    }
    this.getMaritalStatusList();
    this.getCountryList();
    this.getIncomeList();
  }
  getIncomeList(): void {
    const params = {
      query: 'Call RN_MONTHLY_INCOME_GETALL()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.incomeData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          console.log(this.incomeData);
        }
      },
      (error) => console.log(error)
    );
  }
  getCountryList(): void {
    const params = {
      query: 'Call RN_COUNTRY_GETALL()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.countryData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          debugger;
        }
      },
      (error) => console.log(error)
    );
  }
  getMaritalStatusList(): void {
    const params = {
      query: 'Call RN_MARITAL_STATUS_GETALL()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.maritalStatusData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
        }
      },
      (error) => console.log(error)
    );
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
          this.message.showSuccess('Image updated successfully!');
          window.location.reload();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Submit Form ***/
  submitForm(form: NgForm): void {
    const DOB =
      this.birthDate['year'] +
      '-' +
      (this.birthDate['month'] < 10
        ? '0' + this.birthDate['month']
        : this.birthDate['month']) +
      '-' +
      (this.birthDate['day'] < 10
        ? '0' + this.birthDate['day']
        : this.birthDate['day']);
    this.isSubmitted = true;
    if (!form.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    const params = {
      query: `Call RN_UPDATE_CUSTOMER_DETAILS('${this.userData.FIRST_NAME}','${this.userData.MIDDLE_NAME}','${this.userData.LAST_NAME}','${this.userData.MOBILE}','${this.userData.EMAIL}',${this.peopleId},'${this.userData.MONTHLY_INCOME}','${DOB}','${this.userData.AADHAR_CARD_NO}','${this.userData.ADDRESS}','${this.userData.COUNTRY_ID}','${this.userData.MARITAL_STATUS_ID}','${this.userData.OCCUPATION}')`,
      params: '',
    };
    debugger;
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          // this.allUserData.result[0] = this.userData;
          // this.user.setUserLocalData(this.allUserData);
          this.message.showSuccess('Profile updated successfully!');
        }
      },
      (error) => console.log(error)
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  restrictSingleQuote(e) {
    var k;
    document.all ? (k = e.keyCode) : (k = e.which);
    if (k == 39) return false;
  }

  getUserDetailsById(): void {
    const x = Math.floor(Math.random() * 10000 + 1);
    const params = {
      query: `Call RN_GET_USER_DETAILS_BY_ID('${this.peopleId}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          this.userData = resp.data[0].result[0];
          this.birthDate = {
            year: new Date(this.userData.DOB).getFullYear(),
            month: new Date(this.userData.DOB).getMonth() + 1,
            day: new Date(this.userData.DOB).getDate(),
          };
        }
      },
      (error) => console.log(error)
    );
  }
}
