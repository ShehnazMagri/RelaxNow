import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import * as moment from 'moment';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  list: any = [];
  modalRef: BsModalRef;
  appointmentId;
  appointments: any = [];
  TodayAppointments: any = [];
  patients: any = [];
  TodayPatients: any = [];
  TodayPatientsLength = 0;
  patientsLength = 0;
  TotalPatientsLength = 0;
  totalAppointments = 0;
  activeTab = 'today';
  TodayDate = new Date();
  userSubscription: Subscription;
  userId = 0;
  username = '';
  totalAppointmentsCount = 0;
  constructor(
    private toastr: ToastrService,
    private modalService: BsModalService,
    private http: HttpService,
    private user: UserService,
    @Inject(DOCUMENT) private document,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.result[0].USERID;
          this.username =
            userData.result[0].FIRSTNAME + ' ' + userData.result[0].LASTNAME;
          this.initializeFirebase();
          this.getTotalCount();
        }
      }
    );
    this.getPatients();
    this.getAppointments();
  }

  selectTab(activeTab) {
    this.activeTab = activeTab;
  }

  openModal(template: TemplateRef<any>, appointment) {
    this.appointmentId = appointment;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
  }

  getAppointments() {
    const params = {
      query: `Call RN_DOCTOR_APPOINTMENTS(${this.userId},null)`,
      params: '',
    };
    this.appointments = [];
    this.TodayAppointments = [];
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const today = moment();
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.totalAppointments = result.length;
          const appointments = this.sortAppointments(result);
          this.appointments = appointments.filter((a, i) => {
            const dateTime = a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME;
            if (moment(dateTime, 'YYYY-MM-DD hh:mm A').isAfter(today, 'day')) {
              return a;
            }
          });
          this.TodayAppointments = appointments.filter((a, i) => {
            const dateTime = a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME;
            if (moment(dateTime, 'YYYY-MM-DD hh:mm A').isSame(today, 'day')) {
              return a;
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getPatients() {
    const params = {
      query: `Call RN_DOCTOR_PATIENTS(${this.userId},null)`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const today = moment();

          this.patients =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.TotalPatientsLength = this.patients.length;
          this.TodayPatients = this.patients.filter((a, i) => {
            const dateTime = a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME;
            if (moment(dateTime, 'YYYY-MM-DD hh:mm A').isSame(today, 'day')) {
              return a;
            }
          });
          this.TodayPatientsLength = this.TodayPatients.length;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getTotalCount() {
    const params = {
      query: `Call RN_DOCTOR_ALL_APPOINTMENTS(${this.userId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.totalAppointmentsCount =
            resp.data[0].result[0].RN_APPOINTMENT_ID;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  cancel() {
    this.modalRef.hide();
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

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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
