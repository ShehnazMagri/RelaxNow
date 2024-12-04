import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css'],
})
export class DocProfileComponent implements OnInit {
  changePass = true;
  personalDetails = false;
  form: FormGroup;
  isSubmitted = false;
  userSubscription;
  id = 0;
  peopleId = 0;
  userImage = '';

  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'user';
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
          this.peopleId = this.id;
          this.createForm();
          this.getUserImage();
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
      type: 'D',
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
        .postData(`/user/update-passwordadmin`, value)
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
      query: `Call RN_PROFILE_IMAGES_UPSERT(${this.peopleId},1,'${this.userImage}','customer_imag${x}','${this.modifiedBy}')`,
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

  getUserImage(): void {
    const params = {
      query: `Call RN_PROFILE_IMAGES_GET(${this.peopleId},1)`,
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
}
