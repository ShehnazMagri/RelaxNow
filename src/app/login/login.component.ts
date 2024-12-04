import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ApiUrl } from '../core/apiUrl';
import { HttpService } from '../core/services/http/http.service';
import { MessageService } from '../core/services/message/message.service';
import { UserService } from '../core/services/user/user.service';
const CryptoJS = require('crypto-js');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  modalRef: BsModalRef;
  isPatient = false;
  doctors: any = [];
  patients: any = [];
  redirect = '';
  routerSubscription: Subscription;
  docId = '';
  loginForm: FormGroup;
  isSubmitted = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private user: UserService,
    private fb: FormBuilder,
    private message: MessageService,
    private http: HttpService,
    private modalService: BsModalService
  ) {
    this.loginForm = this.fb.group({
      mobile: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
        ],
      ],
      password: ['', [Validators.required]],
      corporateCode: '',
      isCorporate: false,
    });
    this.routerSubscription = this.route.queryParams.subscribe((params) => {
      this.redirect = params['redirect'];
      this.docId = params['doctorId'];
    });
  }

  ngOnInit(): void {
    this.user.userSignOut();
  }

  checkType(event) {
    this.isPatient = event.target.checked ? true : false;
  }

  login(template: TemplateRef<any>) {
    this.isSubmitted = true;
    if (this.loginForm.value.isCorporate == false) {
      this.loginForm.controls['corporateCode'].clearValidators();
    } else {
      this.loginForm.controls['corporateCode'].setValidators([
        Validators.required,
      ]);
    }
    this.loginForm.controls['corporateCode'].updateValueAndValidity();
    if (!this.loginForm.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }

    const params = {
      username: this.loginForm.value.mobile,
      password: this.loginForm.value.password,
      loginType: 'P',
      corporateCode: this.loginForm.value.corporateCode,
    };
    var url = '/login/user';
    if (this.loginForm.value.isCorporate == true) {
      url = '/login/user/corporate';
      localStorage.setItem('_TestId', '0');
    }
    this.http.postData(url, params).subscribe(
      (response) => {
        if (!!response) {
          // response.data[0].result[0].ROLE = 'PATIENT';
          if (response.message == 'UNREGISTER') {
            this.modalRef = this.modalService.show(template, {
              class: 'modal-lg modal-dialog-centered',
            });

            return;
          }
          debugger;

          this.user.setUserLocalData(response.data[0]);
          this.setUserToken(response.data[0].result[0]);
          //this.message.showSuccess('Login Successful!');
          if (this.redirect) {
            console.log(this.redirect);
            if (this.docId) {
              this.router.navigate([this.redirect], {
                queryParams: { id: this.docId },
              });
            } else {
              this.router.navigate([this.redirect]);
            }
          } else {
            const testID = localStorage.getItem('_TestId');
            if (params.corporateCode) {
              this.getCorporateData(
                params.corporateCode,
                response.data[0].result[0].USERID
              );
            } else {
              if (+testID > 0) {
                this.router.navigate(['/p/questions']);
              } else {
                this.router.navigate(['/p/dashboard']);
              }
            }
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getCorporateData(CorporateCode, UserId) {
    const params = {
      CorporateCode,
      UserId,
    };
    this.http.postData('/admin/corporate/get-by-code', params).subscribe(
      (resp: any) => {
        if (!!resp && resp.data) {
          if (resp.data[0] && resp.data[0].tests && resp.data[0].tests.length) {
            var data = resp.data[0];
            if (
              parseInt(resp.data[0].noOfUsers) <= resp.data[0].completedUsers
            ) {
              this.message.showError(
                'User Access limitation exceeded. Please contact NWNT Team.'
              );
              return;
            }

            var upComingDate = moment().add(-1, 'days');
            if (moment(resp.data[0].endDate).toDate() < upComingDate.toDate()) {
              this.message.showError('This assessment has been expired.');
              return;
            }
            debugger;
            if (
              resp.data[0].payment == '1' ||
              resp.data[0].payment == '4' ||
              resp.data[0].payment == '5'
            ) {
              localStorage.setItem('_TestId', resp.data[0].tests[0].testId);
              this.router.navigateByUrl('/p/questions');
            } else {
              this.router.navigateByUrl('/p/dashboard');
            }
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  /*** Set FireBase Token ***/
  setUserToken(userData) {
    // const fcmToken = localStorage.getItem('fcm_token') || '';
    // const params = {
    //   query: `call RN_MANAGE_USER_PUSH_NOTIFICATION('${userData.USERID}','P','${fcmToken}','a')`,
    //   params: '',
    // };
    // this.http.postData(ApiUrl.queryExecute, params).subscribe(
    //   (response) => {
    //     if (!!response) {
    //     }
    //   },
    //   (err) => {
    //     console.log(err);
    //   }
    // );
  }

  UnregisterCorporate() {
    const params = {
      mobile: this.loginForm.value.mobile,
      params: '',
    };
    this.http.postData('/api/unregisteruser', params).subscribe(
      (response) => {
        if (!!response) {
          this.message.showSuccess(
            'Corporate account un-register successfully.'
          );
          this.modalRef.hide();
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
