import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css'],
})
export class AssessmentComponent implements OnInit, OnDestroy {
  list: any = [];
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

  constructor(private http: HttpService, private user: UserService) {}

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.result[0].USERID;
        }
      }
    );
    this.getAppointments();
  }

  getAppointments() {
    const today = moment();

    const params = {
      query: `Call RN_FIRST_APPOINTMENTS_LIST_GET('${moment().format(
        'YYYY-MM-DD'
      )}')`,
      params: '',
    };
    this.appointments = [];
    this.TodayAppointments = [];
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.totalAppointments = result.length;
          const appointments = this.sortAppointments(result);
          this.appointments = appointments.filter((a, i) => {
            const dateTime = a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME;
            if (
              moment(dateTime, 'YYYY-MM-DD hh:mm A').isSame(today, 'day') ||
              moment(dateTime, 'YYYY-MM-DD hh:mm A').isAfter(today, 'day')
            ) {
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
}
