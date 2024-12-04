import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({});
  isSubmitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private user: UserService,
    private message: MessageService,
    private http: HttpService
  ) {
    this.createLoginForm();
  }

  ngOnInit(): void {}
  /*** Intialize Login Form ***/
  createLoginForm() {
    const emailPattern = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  /*** Get Login Form Controls ***/
  get userForm() {
    return this.loginForm.controls;
  }

  /*** Submit Login Form ***/
  onSubmit() {
    this.isSubmitted = true;
    if (!this.loginForm.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    // const params = {
    //   query: `call RN_SP_GetUserByMobile('${this.loginForm.value.email}','${this.loginForm.value.password}')`,
    //   params: '',
    // };
    const params = {
      username: this.loginForm.value.email,
      password: this.loginForm.value.password,
      loginType: 'D',
    };

    this.http.postData(`/login/user/admin`, params).subscribe(
      (response) => {
        if (!!response) {
          this.user.setUserLocalData(response.data[0]);
          this.setUserToken(response.data[0].result[0]);
          this.message.showSuccess('Login Successful');

          if (response.data[0].result[0].IS_SUPERADMIN == true) {
            this.router.navigate(['/sadm/dashboard']);
          } else if (response.data[0].result[0].ROLE == 'Receptionist') {
            this.router.navigate(['/reception/dashboard']);
          } else {
            this.router.navigate(['/admin/dashboard']);
          }
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
    //   query: `call RN_MANAGE_USER_PUSH_NOTIFICATION('${userData.USERID}','P','${fcmToken}','W')`,
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
