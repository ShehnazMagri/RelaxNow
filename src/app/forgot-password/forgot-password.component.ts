import { Component, OnInit } from '@angular/core';
import { trim } from 'jquery';
import { ApiUrl } from '../core/apiUrl';
import { HttpService } from '../core/services/http/http.service';
import { MessageService } from '../core/services/message/message.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  datatable: any;
  public appointments = [];
  email: null;
  constructor(private http: HttpService, private message: MessageService) {}

  ngOnInit(): void {}

  forgetPassword(): void {
    //
    if (this.email == null || trim(this.email) == '') {
      this.message.showError('Email is required.');
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.message.showError('Email address is not valid.');
      return;
    }
    const params = {
      email: this.email,
      params: '',
      type: 'P',
    };
    this.http.postData(`/user/forget-password`, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          if (resp.status == 200 && resp.message == 'OK') {
            this.message.showSuccess(
              'Change password link is send to your register email.'
            );
          } else {
            this.message.showError('Email is not registered.');
          }
        }
      },
      (error) => console.log(error)
    );
  }

  validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
}
