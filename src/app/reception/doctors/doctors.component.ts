import { NgForm } from '@angular/forms';
import { Component, OnInit, TemplateRef } from '@angular/core';
import * as $ from 'jquery';
import { ApiUrl } from './../../core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MessageService } from 'src/app/core/services/message/message.service';
@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css'],
})
export class DoctorsComponent implements OnInit {
  doctorsList: any = [];
  errorMessage: string;
  public docters = [];
  modalRef: BsModalRef;
  isSubmitted = false;
  newPassword = '';
  confirmPassword = '';
  selectedUser: any = null;
  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.getDoctors();
  }

  getDoctors() {
    const params = {
      query: 'call RN_PEOPLE_SEARCH()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.docters = result;
console.log(result);

          $(function () {
            $('table').DataTable();
          });
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Open Reset Password Modal ***/
  openModal(template: TemplateRef<any>, user): void {
    this.newPassword = '';
    this.confirmPassword = '';
    this.selectedUser = user;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-md modal-dialog-centered',
    });
  }

  /*** Submit Password ***/
  submitPassword(form: NgForm): void {
    this.isSubmitted = true;
    if (!form.valid || this.newPassword !== this.confirmPassword) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    const params = {
      id: this.selectedUser.DOCTOR_ID,
      newPassword: this.newPassword,
      type: 'D',
    };
    this.http.postData(ApiUrl.admin.updateUserPassword, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.message.showSuccess('Password Changed Successfully!');
          this.modalRef.hide();
        } else {
          this.message.showError('Error! Unable to Change password.');
        }
      },
      (error) => console.log(error)
    );
  }
}
