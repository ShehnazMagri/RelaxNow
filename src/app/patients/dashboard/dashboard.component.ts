import { Router } from '@angular/router';
import { MessageService } from 'src/app/core/services/message/message.service';
import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  Inject,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { CommonServiceService } from './../../common-service.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import { NotificationService } from '../../core/services/notification/notification.service';
import { DOCUMENT, Location } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  appointments = [];
  todayAppointments: any = [];
  patients;
  userSubscription: Subscription;
  userId = 0;
  dtTrigger: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  reports = [];
  corporateData = [{ tests: [] }];
  billings = [];
  modalRef: BsModalRef;
  pdf: any;
  fileName = '';
  isSubmitted = false;
  fileData;
  filetoUpload;
  activeTab = 'today';
  isCorporate = false;
  showReportTable = false;
  username = '';
  purchasedTest = [];
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
    {
      id: 'Investigations (Blood reports, Ultrasound, MRI, CT-Scan, etc.)',
      value: 'Investigations (Blood reports, Ultrasound, MRI, CT-Scan, etc.)',
    },
    {
      id: 'Old Prescriptions',
      value: 'Old Prescriptions',
    },
    {
      id: 'Report of Psychological Assessment',
      value: 'Report of Psychological Assessment',
    },
    {
      id: 'Referral Note',
      value: 'Referral Note',
    },
    {
      id: 'Therapy related document',
      value: 'Therapy related document',
    },
    {
      id: 'Others',
      value: 'Others',
    },
  ];
  dtOptions: DataTables.Settings = { order: [] };
  constructor(
    public commonService: CommonServiceService,
    private http: HttpService,
    protected sanitizer: DomSanitizer,
    private user: UserService,
    private message: MessageService,
    private modalService: BsModalService,
    private router: Router,
    @Inject(DOCUMENT) private document,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    localStorage.setItem('_TestId', '0');
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.result[0].USERID;
          this.username =
            userData.result[0].FIRSTNAME + ' ' + userData.result[0].LASTNAME;

          if (
            userData.result[0].CORPORATECODE != null &&
            userData.result[0].CORPORATECODE != ''
          ) {
            this.isCorporate = true;
            this.getCorporateData(userData.result[0].CORPORATECODE);
          }
        }
      }
    );
    if (this.userId) {
      this.initializeFirebase();
      this.getAppointments();
      this.getPatientReports();
      this.getPatientBilling();
      this.getPurchasedTest();
    }
  }

  selectTab(activeTab) {
    this.activeTab = activeTab;
  }
  getAppointments() {
    const params = {
      query: `Call RN_PATIENT_APPOINTMENTS(${this.userId},'')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const today = moment();
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];

          const appointments = result.sort((a, b) => {
            const dateA: any = new Date(
              a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME
            );
            const dateB: any = new Date(
              b.APPOINTMENT_DATE + ' ' + b.APPOINTMENT_TIME
            );
            return dateA - dateB;
          }); //this.sortAppointments(result);
          this.appointments = appointments.filter((a, i) => {
            const dateTime = a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME;
            if (moment(dateTime, 'YYYY-MM-DD hh:mm A').isAfter(today, 'day')) {
              return a;
            }
          });
          this.todayAppointments = appointments.filter((a, i) => {
            const dateTime = a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME;
            if (moment(dateTime, 'YYYY-MM-DD hh:mm A').isSame(today, 'day')) {
              return a;
            }
          });
          this.dtTrigger.next();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getPatients() {
    this.commonService.getpatients().subscribe((res) => {
      this.patients = res;
    });
  }

  getPatientReports() {
    const params = {
      query: `Call GET_CUSTOMER_TEST_REPORT(${this.userId})`,
      params: '',
    };
    this.showReportTable = false;
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
          this.showReportTable = true;
          // setTimeout(() => {

          //   this.dtTrigger2.next();
          // }, 1000);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getCorporateData(CorporateCode) {
    const params = {
      CorporateCode: CorporateCode,
      UserId: this.userId,
    };
    this.http.postData('/admin/corporate/get-by-code', params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.corporateData = resp.data;
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
  openModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
      backdrop: 'static',
    });
  }
  getPatientBilling(): void {
    const params = {
      query: `call GET_RECEIPT_INFO(${this.userId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.billings =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.dtTrigger3.next();
        }
      },
      (error) => console.log(error)
    );
  }

  getInvoice(appointmentId, template): void {
    this.http
      .postData(ApiUrl.payuInvoice, { appointtment_id: appointmentId })
      .subscribe(
        (resp: any) => {
          if (!!resp && resp.data) {
            const result = resp.data;
            this.showPdf(result, template);
          }
        },
        (error) => console.log(error)
      );
  }
  showPdf(base64, template) {
    this.pdf = this.sanitizer.bypassSecurityTrustResourceUrl(
      'data:application/pdf;base64,' + base64
    );
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
  }

  /*** Sort Array by prescription and date ***/
  sortAppointments(data): any[] {
    const result1 = [];
    const result2 = [];
    data.forEach((element) => {
      if (!element.PRESCRIPTION_ID || element.PRESCRIPTION_ID == '0') {
        result1.push(element);
      } else {
        result2.push(element);
      }
    });
    if (result1.length) {
      result1.sort((a, b) => {
        const dateA: any = new Date(
          a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME
        );
        const dateB: any = new Date(
          b.APPOINTMENT_DATE + ' ' + b.APPOINTMENT_TIME
        );
        return dateA - dateB;
      });
    }
    if (result2.length) {
      result2.sort((a, b) => {
        const dateA: any = new Date(
          a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME
        );
        const dateB: any = new Date(
          b.APPOINTMENT_DATE + ' ' + b.APPOINTMENT_TIME
        );
        return dateA - dateB;
      });
    }
    return result1.concat(result2);
  }
  /*** UnSubscribe the events to prevent memory leakage ***/
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger2.unsubscribe();
    this.dtTrigger3.unsubscribe();
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  redirectToTest(item) {
    if (item.payment == '1' || item.payment == '4' || item.payment == '5') {
      localStorage.setItem('_TestId', item.testId);
      this.router.navigateByUrl('/p/test-details');
    } else {
      if (
        item.paymentstatus == 'success' ||
        item.paymentstatus == 'Succes' ||
        item.paymentstatus == 'SUCCESS'
      ) {
        localStorage.setItem('_TestId', item.testId);
        localStorage.setItem('CART_DETAIL_ID', '0');
        this.router.navigateByUrl('/p/test-details');
      } else {
        localStorage.setItem(
          '_assesmentData',
          JSON.stringify(this.corporateData[0])
        );
        this.router.navigateByUrl('/p/checkout/Organizational-Clients');
      }
    }
  }

  redirectTOPurchasedTest(item) {
    debugger;
    localStorage.setItem('_TestId', item.testId);
    localStorage.setItem('CART_DETAIL_ID', item.CART_DETAIL_ID);
    this.router.navigateByUrl('/p/test-details');
  }
  purchaseToTest(item) {
    localStorage.setItem(
      '_assesmentData',
      JSON.stringify(this.corporateData[0])
    );
    this.router.navigateByUrl('/p/checkout/Organizational-Clients');
  }

  getPurchasedTest(): void {
    this.http.getData('/api/services/get', null).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.purchasedTest = resp.data;
        }
      },
      (error) => console.log(error)
    );
  }

  initializeFirebase() {
    // [
    //   'https://www.gstatic.com/firebasejs/7.6.0/firebase.js',
    //   'https://www.gstatic.com/firebasejs/7.6.0/firebase-app.js',
    //   'https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js',
    // ].forEach((js) => {
    //   const script = this.document.createElement('script');
    //   script.type = 'text/javascript';
    //   script.src = js;
    //   this.document.getElementsByTagName('head')[0].appendChild(script);
    // });
    // (async () => {
    //   await this.delay(2000);
    //   this.notification.firebaseInit();
    // })();
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
