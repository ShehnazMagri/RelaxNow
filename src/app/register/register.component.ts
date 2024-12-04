import { Message } from 'twilio-chat/lib/message';
import { ApiUrl } from './../core/apiUrl';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { CommonServiceService } from '../common-service.service';
import { HttpService } from '../core/services/http/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from '../core/services/message/message.service';
import { UserService } from '../core/services/user/user.service';
import * as moment from 'moment';
import { DeviceDetectorService } from 'ngx-device-detector';
const CryptoJS = require('crypto-js');
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup({});

  isPatient = true;
  doctors: any = [];
  patients: any = [];
  regType = 'Patient Register';
  docPatient = 'Are you a Doctor?';
  isSubmitted = false;
  genderData = [];
  emailPattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/);
  telPattern = new RegExp(
    /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
  );
  isAnonymous = false;

  constructor(
    private message: MessageService,
    public commonService: CommonServiceService,
    public router: Router,
    private http: HttpService,
    private fb: FormBuilder,
    private user: UserService,
    private route: ActivatedRoute,
    private deviceService: DeviceDetectorService
  ) {
    this.createSignupForm();
  }

  ngOnInit(): void {
    let url = this.route.snapshot.params.id;

    if (url) {
      url = url
        .replaceAll('xMl3Jk', '+')
        .replaceAll('Por21Ld', '/')
        .replaceAll('Ml32', '=');
      const bytes = CryptoJS.AES.decrypt(url, '@Test');
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      localStorage.setItem('ScheduleTestName', originalText);
      const params = {
        Name: originalText,
      };
      debugger;
      this.executeRequestGet(params);
    } else {
      localStorage.setItem('ScheduleTestName', '0');
      localStorage.setItem('ScheduleTestId', '0');
      localStorage.setItem('_TestId', '0');
    }
  }

  /*** Intialize Register Form ***/
  createSignupForm() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern(this.telPattern)]],
      mEmail: [
        '',
        [Validators.required, Validators.pattern(this.emailPattern)],
      ],
      password: ['', [Validators.required]],
      mName: [''],
      lName: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      terms: [null, [Validators.required]],
      code: [null],
    });
  }
  signup() {
    this.isSubmitted = true;
    if (this.registerForm.value.terms == false) {
      this.registerForm.get('terms').setValue(null);
    }
    if (!this.registerForm.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    if (this.registerForm.value.mEmail.indexOf('mailinator.com') > -1) {
      this.message.showError('Email address is not valid.');
      return;
    }
    const testID = localStorage.getItem('ScheduleTestId');
    if (parseInt(testID) > 0 && this.isAnonymous == false) {
      this.validateScheduleTestUser();
    } else {
      this.register();
    }
  }

  register() {
    const formData = this.registerForm.value;
    this.executeRequest(formData);
  }
  validateScheduleTestUser() {
    const formData = this.registerForm.value;
    const params = {
      query: formData.mEmail,
      params: localStorage.getItem('ScheduleTestId'),
    };
    // 'Name3','Mname','LName','7009168120','Test@gmail.com','1'
    this.executeRequestValidate(params);
  }

  /*** Execute Procedular query  ***/
  executeRequest(params: any): void {
    this.http.postData(`/register`, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (resp.message == 'emailerror') {
            this.message.showError('Email id already exists.');
          } else if (resp.message == 'phoneerror') {
            this.message.showError('Phone number already exists.');
          } else {
            this.user.setUserLocalData(resp.data[0]);
            this.message.showSuccess('Successfully Registered!');
            this.router.navigate(['/p/dashboard']);
            var params2 = {
              Patient_Name: params.name,
              Email: params.mEmail,
              Template_Name: 'ACCOUNT_CREATED',
              Mobile: params.mobile,
            };
            this.http.postData(ApiUrl.email, params2).subscribe((resp: any) => {
              if (!!resp) {
              }
            });
          }
        }
      },
      (error) => console.log(error)
    );
  }

  executeRequestValidate(params: any): void {
    this.http.postData(`/api/executeproc/obj/validate`, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (resp.data != null && resp.data.length > 0) {
            this.register();
          } else {
            // localStorage.setItem('ScheduleTestName', '0');
            // localStorage.setItem('ScheduleTestId', '0');
            // localStorage.setItem('_TestId', '0');
            this.message.showError(
              'Provide email is not registered for this test.'
            );
          }
        }
      },
      (error) => console.log(error)
    );
  }

  executeRequestGet(params: any): void {
    //
    this.http.postData(`/api/scheduletest/get-schedule-test`, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          debugger;
          if (parseInt(resp.data[0].NO_OF_USERS) <= resp.data[0].COUNT) {
            localStorage.setItem('ScheduleTestName', '0');
            localStorage.setItem('ScheduleTestId', '0');
            localStorage.setItem('_TestId', '0');
            this.message.showError('This test is completed.');
            return;
          }

          var upComingDate = moment().add(-1, 'days');
          var currentDate = moment();
          if (moment(resp.data[0].END_DATE).toDate() < upComingDate.toDate()) {
            localStorage.setItem('ScheduleTestName', '0');
            localStorage.setItem('ScheduleTestId', '0');
            localStorage.setItem('_TestId', '0');
            this.message.showError('This test has been expired.');
            return;
          }
          // if (moment(resp.data[0].START_DATE).add(-1,'days').toDate() >= currentDate.toDate()) {
          //   localStorage.setItem('ScheduleTestName', '0');
          //   localStorage.setItem('ScheduleTestId', '0');
          //   localStorage.setItem('_TestId', '0');
          //   this.message.showError('This test has not been started yet.');
          //   return;
          // }
          const response = resp.data[0];
          this.isAnonymous = resp.data[0].ANONYMOUS;
          localStorage.setItem('ScheduleTestId', resp.data[0].ID);
          localStorage.setItem('_TestId', resp.data[0].TEST_ID);
          var deviceInfo = this.deviceService.getDeviceInfo();
          if (deviceInfo.os == 'iOS') {
            // window.location.href = `https://ax6y2.app.link/?test=${resp.data[0].TEST_ID}`;
            // return;
          }
        }
      },
      (error) => console.log(error)
    );
  }
}
