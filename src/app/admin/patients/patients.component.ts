import { Router } from '@angular/router';
import { MessageService } from './../../core/services/message/message.service';
import { Component, OnInit, TemplateRef } from '@angular/core';
import * as $ from 'jquery';

import { ApiUrl } from './../../core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { NgForm } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientDetailsComponent } from 'src/app/admin/patient-details/patient-details.component';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
})
export class PatientsComponent implements OnInit {
  patientsList: any = [];
  errorMessage: string;
  public patients = [];
  modalRef: BsModalRef;
  isSubmitted = false;
  newPassword = '';
  confirmPassword = '';
  selectedUser: any = null;

  constructor(
    private modalService: BsModalService,
    private modal: NgbModal,
    private http: HttpService,
    private message: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getPatients();
  }

  getPatients() {
    const params = {
      query: 'call RN_CUSTOMER_GET()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.patients = result;
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

  /*** Open Patient Details ***/
  openPatientModal(patient): void {
    this.router.navigate(['/admin/patient-details', patient.ID]);
    // const modalRef = this.modal.open(PatientDetailsComponent, {
    //   scrollable: false,
    //   size: 'lg',
    // });
    // modalRef.componentInstance.patientId = patient.ID;
    // modalRef.result.then(
    //   (result) => {},
    //   (reason) => {}
    // );
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
      id: this.selectedUser.ID,
      newPassword: this.newPassword,
      type: 'P',
    };
    this.http.postData(ApiUrl.admin.updateUserPassword, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.message.showSuccess('Password Changed Successfully!');
          this.modalRef.hide();
        }
      },
      (error) => console.log(error)
    );
  }
}
