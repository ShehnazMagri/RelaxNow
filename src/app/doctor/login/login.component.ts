import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiUrl } from '../../core/apiUrl';
import { HttpService } from '../../core/services/http/http.service';
import { MessageService } from '../../core/services/message/message.service';
import { UserService } from '../../core/services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  isPatient = false;
  doctors: any = [];
  patients: any = [];
  loginForm: FormGroup;

  isSubmitted = false;
  constructor(
    private router: Router,
    private user: UserService,
    private fb: FormBuilder,
    private message: MessageService,
    private http: HttpService
  ) {}

  ngOnInit(): void {
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
    });
  }

  checkType(event) {
    this.isPatient = event.target.checked ? true : false;
  }

  login() {
    this.isSubmitted = true;
    if (!this.loginForm.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    const params = {
      username: this.loginForm.value.mobile,
      password: this.loginForm.value.password,
      loginType: 'D',
    };

    this.http.postData(`/login/user`, params).subscribe(
      (response) => {
        if (!!response) {
          //
          // response.data[0].result[0].ROLE = 'PATIENT';
          // this.user.setUserLocalData(response.data[0]);
          // this.setUserToken(response.data[0].result[0]);
          // this.message.showSuccess('Login Successful!');
          // this.router.navigate(['/doctor/dashboard']);

          this.user.setUserLocalData(response.data[0]);
          this.setUserToken(response.data[0].result[0]);
          this.message.showSuccess('Login Successful');
          this.router.navigate(['/doctor/dashboard']);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  /*** Set FireBase Token ***/
  setUserToken(userData) {
    // const fcmToken = localStorage.getItem('fcm_token') || '';
    // const params = {
    //   query: `call RN_MANAGE_USER_PUSH_NOTIFICATION('${userData.USERID}','D','${fcmToken}','A')`,
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
}
