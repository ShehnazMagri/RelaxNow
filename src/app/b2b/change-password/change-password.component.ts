import { MessageService } from 'src/app/core/services/message/message.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/core/services/http/http.service';
import { ApiUrl } from 'src/app/core/apiUrl';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  isSubmitted = false;
  userSubscription;
  id = 0;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private message: MessageService,
    private user: UserService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.id = userData.result[0].USERID;
          this.createForm();
        }
      }
    );
  }

  createForm() {
    this.form = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      id: this.id,
      type: 'P',
    });
  }

  onSubmit(value) {
    this.isSubmitted = true;
    if (!this.form.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    if (value.newPassword === value.confirmPassword) {
      this.http
        .postData(`/user/update-password`, value)
        .subscribe((response) => {
          //
          if (!!response && response.data) {
            //
            this.message.showSuccess('Password Changed Successfully');
            this.form.reset();
            this.isSubmitted = false;
          } else {
            this.message.showError('Invalid old Password.');
          }
        });
    } else {
      this.message.showError('New password and confirm password not matched');
    }
  }
}
