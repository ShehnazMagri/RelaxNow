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
export class CorporateRegisterComponent implements OnInit {
  registerForm = new FormGroup({});

  isPatient = true;
  code = '';
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
  ) {}

  ngOnInit(): void {
    // Note: Below 'queryParams' can be replaced with 'params' depending on your requirements
    this.route.queryParams.subscribe((params) => {
      var code = params['code'];
      if (code != null && code != '') {
        this.code = code;
      }
      var deviceInfo = this.deviceService.getDeviceInfo();
      if (deviceInfo.os == 'iOS') {
        // window.location.href = `https://ax6y2.app.link/?i_code=${this.code}&test=ssss`;
        // return;
      }
    });
    this.createSignupForm();
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
      code: [this.code, [Validators.required]],
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
    this.validateScheduleTestUser();
  }

  register() {
    const formData = this.registerForm.value;
    this.executeRequest(formData);
  }
  validateScheduleTestUser() {
    const formData = this.registerForm.value;
    const params = {
      code: formData.code,
    };
    this.executeRequestValidate(params);
  }

  /*** Execute Procedular query  ***/
  executeRequest(params: any): void {
    this.http.postData(`/register/Corporate`, params).subscribe(
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
    this.http.postData(`/register/validate-code`, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (resp.data != null && resp.data.length > 0) {
            this.register();
          } else {
            this.message.showError('Invalid Corporate Code.');
          }
        }
      },
      (error) => console.log(error)
    );
  }
}
