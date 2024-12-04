import { Router } from '@angular/router';
import { MessageService } from 'src/app/core/services/message/message.service';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { UserService } from 'src/app/core/services/user/user.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { LoaderService } from 'src/app/core/services/loader/loader.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit, AfterViewInit, OnDestroy {
  modalRef: BsModalRef;
  appointments: any = [];

  // Datatable Options
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  userSubscription: Subscription;
  userId = 0;
  userData;
  searchText = '';
  searchTextPrevious = '';
  reports = [];
  upcomingAppointment = [];
  previous = [];
  fileName = '';
  isSubmitted = false;
  fileData;
  filetoUpload;
  //review
  reviewForm = new FormGroup({});
  isRecommend = 1;
  docId = 0;
  public documentsLists = [
    {
      id: 'Aadhar card',
      value: 'Aadhar card',
    },
    {
      id: 'Pan card',
      value: 'Pan card',
    },
    {
      id: 'Driving Licence',
      value: 'Driving Licence',
    },
    {
      id: 'Voter ID Card',
      value: 'Voter ID Card',
    },
    {
      id: 'Passport',
      value: 'Passport',
    },
    {
      id: 'E-Aadhaar Card',
      value: 'E-Aadhaar Card',
    },
  ];
  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private fb: FormBuilder,
    private user: UserService,
    private loader: LoaderService,
    private message: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.result[0].USERID;
          this.userData = userData.result[0];
        }
      }
    );
    this.getPatientReports();
    this.getAppointments();
    this.createReviewForm();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  /*** Initialize form***/
  createReviewForm(): void {
    this.reviewForm = this.fb.group({
      rating: ['5', [Validators.required]],
      review: ['', [Validators.required]],
      terms: ['', [Validators.required]],
    });
  }

  /*** Post review ***/
  submitReview(): void {
    this.isSubmitted = true;
    if (!this.reviewForm.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    const data = this.reviewForm.value;

    const params = {
      query: `Call RN_PEOPLE_REVIEW_INSERT('${this.docId}','${this.userId}','${
        data.review
      }','${data.rating}','${moment().format('YYYY-MM-DD')}','1','${
        this.isRecommend
      }','${this.userData.FIRSTNAME + ' ' + this.userData.LASTNAME}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.reviewForm.reset();
          this.modalRef.hide();
          this.message.showSuccess('Review added successfully!');
        }
      },
      (error) => console.log(error)
    );
  }

  videoCall(appointmentDetails): void {
    localStorage.setItem('call_room', appointmentDetails.RN_APPOINTMENT_ID);
    const params = {
      ToUserId: `${appointmentDetails.DOCTOR_ID}`,
      UserType: 'D',
      Room: `${appointmentDetails.RN_APPOINTMENT_ID}`,
      CallerId: `${appointmentDetails.CUSTOMER_ID}`,
      appointmentId: `${appointmentDetails.RN_APPOINTMENT_ID}`,
      CallerType: 'P',
    };
    this.http.postData(ApiUrl.notifyUser, params).subscribe((resp) => {
      this.router.navigate([
        '/p/chat-portal',
        appointmentDetails.RN_APPOINTMENT_ID,
      ]);
    });
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  rerender(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtTrigger.next();
      });
    }
  }

  getAppointments() {
    debugger;
    const params = {
      query: `Call RN_PATIENT_APPOINTMENTS(${this.userId},'')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        this.loader.show();

        if (!!resp) {
          //
          this.appointments =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          const today = moment();
          this.upcomingAppointment = this.appointments.filter((a, i) => {
            const dateTime = a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME;
            if (moment(dateTime, 'YYYY-MM-DD hh:mm A').isSame(today, 'day')) {
              if (
                today.isAfter(moment(a.APPOINTMENT_TIME, 'hh:mm A')) &&
                today.isBefore(moment(a.APPOINTMENT_ENDTIME, 'hh:mm A'))
              ) {
                a['enableCall'] = true;
              }
              return a;
            }
          });

          this.upcomingAppointment.sort((a, b) => {
            const dateA: any = new Date(
              a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME
            );
            const dateB: any = new Date(
              b.APPOINTMENT_DATE + ' ' + b.APPOINTMENT_TIME
            );
            return dateA - dateB;
          });
          this.previous = this.appointments.filter((a, i) => {
            const dateTime = a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME;
            if (moment(dateTime, 'YYYY-MM-DD hh:mm A').isBefore(today, 'day')) {
              return a;
            }
          });

          this.previous.sort((a, b) => {
            const dateA: any = new Date(
              a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME
            );
            const dateB: any = new Date(
              b.APPOINTMENT_DATE + ' ' + b.APPOINTMENT_TIME
            );
            return dateA - dateB;
          });
          this.rerender();
          this.loader.hide();
        } else {
          this.loader.hide();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getPatientReports() {
    const params = {
      query: `Call GET_CUSTOMER_TEST_REPORT(${this.userId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.reports = data.filter((v) => {
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
            userId: this.userId,
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
  openModal(template: TemplateRef<any>, docId = 0): void {
    this.docId = docId;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
      backdrop: 'static',
    });
  }
  /*** Intiate User Call ***/
  callUser(people: any): void {
    const user = {
      name: people.DOCTOR_FIRST_NAME + ' ' + people.DOCTOR_LAST_NAME,
      image: people.People_IMAGE,
      userType: 1,
      mobile: people.PhoneNumber,
    };
    this.user.setCallUser(user);
  }
}
