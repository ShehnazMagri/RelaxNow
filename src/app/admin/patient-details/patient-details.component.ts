import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../core/services/message/message.service';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { ApiUrl } from '../../core/apiUrl';
import { HttpService } from '../../core/services/http/http.service';
import { Subscription } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserService } from 'src/app/core/services/user/user.service';
@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css'],
})
export class PatientDetailsComponent implements OnInit {
  patient;
  prescription = '';
  appointmentId = 0;
  patientId = 0;
  patientHistory = [];
  userSubscription: Subscription;
  userRole;
  reportsData = [];

  modalRef: BsModalRef;
  fileName = '';
  isSubmitted = false;
  fileData;
  filetoUpload;
  userId = 0;






  public documentsLists=[{
    id:'Investigations (Blood reports, Ultrasound, MRI, CT-Scan, etc.)',
    value:'Investigations (Blood reports, Ultrasound, MRI, CT-Scan, etc.)'

  },{
    id:'Old Prescriptions',
    value:'Old Prescriptions'

  },{
    id:'Report of Psychological Assessment',
    value:'Report of Psychological Assessment'

  },{
    id:'Referral Note',
    value:'Referral Note'

  },{
    id:'Therapy related document',
    value:'Therapy related document'

  },{
    id:'Others',
    value:'Others'

  }];
  constructor(
    private http: HttpService,
    private modalService: BsModalService,
    private user: UserService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params.id;

    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.result[0].USERID;
        }
      }
    );
    this.getPatientReports();
    this.getPatientDetails(this.patientId);
  }

  getPatientDetails(id) {
    const params = {
      query: `Call RN_CUSTOMER_GET_BY_ID(${id})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.patient = data[0];
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getPatientReports() {
    const params = {
      query: `Call GET_CUSTOMER_TEST_REPORT(${this.patientId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.reportsData = data.filter((v) => {
            if (v.RESULT_FILE) {
              return v;
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  /*** On File select ***/
  onFileSelect(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const parts = file.name.split('.');
      // if (file.size / 1024 / 1024 < 5) {
      if (['jpg', 'jpeg', 'pdf', 'png'].includes(parts[parts.length - 1])) {
        const reader: FileReader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = (e: any) => {
          this.fileData = {
            Name: this.fileName,
            userId: this.patientId,
            createdBy: this.userId,
            base64File: e.target.result,
            fileExtension: parts[parts.length - 1],
            creatorUserType: 2,
          };
        };
      } else {
        this.message.showError('Invalid File Type');
      }
    }
  }
  /*** Upload File ***/
  uploadFile(form: NgForm): void {
    this.isSubmitted = true;
    if (!form.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    if (!this.fileData) {
      this.message.showError('Please choose a valid file');
      return;
    }
    this.fileData.Name = this.fileName;
    this.http.postData(ApiUrl.uploadFile, this.fileData).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.modalRef.hide();
          this.fileData = null;
          this.filetoUpload = null;
          this.fileName = '';
          this.isSubmitted = false;
          this.message.showSuccess('File uploaded successfully!');
          this.getPatientReports();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Open Add/Edit Modal ***/
  openModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
      backdrop: 'static',
    });
  }
}
