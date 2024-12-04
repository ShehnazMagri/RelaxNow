import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trim } from 'jquery';
import { HttpService } from '../core/services/http/http.service';
import { MessageService } from '../core/services/message/message.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  token = '';
  password = null;
  confirmPassword = null;
  constructor(
    private http: HttpService,
    private message: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.token = this.route.snapshot.params.id;
  }

  changePassword(): void {
    //
    if (this.password == null || trim(this.password) == '') {
      this.message.showError('Password is required.');
      return;
    }
    if (this.confirmPassword != this.password) {
      this.message.showError('Password is not matched with confirm password.');
      return;
    }
    const params = {
      password: this.password,
      params: '',
      token: this.token,
      type: 'D',
    };
    this.http.postData(`/user/change-password`, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          if (resp.status == 200 && resp.message == 'OK') {
            this.message.showSuccess(
              'Password changed successfully. Please login with new password.'
            );
            this.router.navigateByUrl('/doctor/login');
          } else {
            this.message.showError('Token is not valid.');
          }
        }
      },
      (error) => console.log(error)
    );
  }
}
