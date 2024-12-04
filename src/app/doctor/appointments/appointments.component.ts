import { Router } from '@angular/router';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { UserService } from 'src/app/core/services/user/user.service';
import * as moment from 'moment';
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
  searchText = '';
  options: any = {
    locale: { format: 'YYYY-MM-DD' },
    alwaysShowCalendars: false,
  };
  daterange: any = {};
  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private user: UserService,
    private loader: LoaderService,
    private router: Router
  ) {}

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

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
  selectedDate(value: any, datepicker?: any) {
    // this is the date  selected

    // any object can be passed to the selected event and it will be passed back here
    datepicker.start = value.start;
    datepicker.end = value.end;

    // use passed valuable to update state
    this.daterange.start = value.start;
    this.daterange.end = value.end;
    this.daterange.label = value.label;
    this.getAppointments2();
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

  getAppointments(): void {
    const params = {
      query: `Call RN_DOCTOR_APPOINTMENTS(${this.userId},null)`,
      params: '',
    };
    this.appointments = [];
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        this.loader.show();
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];

          this.appointments = this.sortAppointments(result);
          // this.appointments = this.sortAppointments2(this.appointments);
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

  getAppointments2(): void {
    const params = {
      query: `Call RN_DOCTOR_APPOINTMENTS_BY_DATE(${this.userId},'${moment(
        this.daterange.start
      ).format('YYYY-MM-DD')}','${moment(this.daterange.end).format(
        'YYYY-MM-DD'
      )}')`,
      params: '',
    };
    this.appointments = [];
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        this.loader.show();
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];

          this.appointments = this.sortAppointments(result);
          // this.appointments = this.sortAppointments2(this.appointments);
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

  sendPushNotification(appointmentDetails): void {
    localStorage.setItem(
      'call_room',
      appointmentDetails.DOCTOR_FIRST_NAME +
        '' +
        appointmentDetails.DOCTOR_LAST_NAME
    );
    const params = {
      ToUserId: `${appointmentDetails.CUSTOMER_ID}`,
      UserType: 'P',
      Room: `${
        appointmentDetails.DOCTOR_FIRST_NAME +
        '' +
        appointmentDetails.DOCTOR_LAST_NAME
      }`,
      appointmentId: `${appointmentDetails.RN_APPOINTMENT_ID}`,
      CallerId: `${appointmentDetails.PEOPLE_ID}`,
      CallerType: 'D',
    };
    this.http.postData(ApiUrl.notifyUser, params).subscribe((resp) => {
      this.router.navigate([
        '/doctor/chat-portal',
        appointmentDetails?.RN_APPOINTMENT_ID,
      ]);
    });
  }

  addChatToAppointment(appointmentDetails) {
    localStorage.setItem('ChatChannelID', appointmentDetails.CUSTOMER_ID);
    this.router.navigateByUrl('/doctor/message');
  }
  /*** Sort Array by prescription and date ***/
  sortAppointments(data): any[] {
    const result1 = [];
    const result2 = [];
    const today = moment();

    data.forEach((element) => {
      const dateTime =
        element.APPOINTMENT_DATE + ' ' + element.APPOINTMENT_TIME;

      element.APPOINTMENT_DATE = moment(
        new Date(element.APPOINTMENT_DATE)
      ).format('DD MMM yyyy');
      // if (!element.PRESCRIPTION_ID || element.PRESCRIPTION_ID == '0') { //previous logic
      if (moment(dateTime, 'YYYY-MM-DD hh:mm A').isSame(today, 'day')) {
        // new Logic
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
  /*** Sort Array by prescription and date ***/
  sortAppointments2(data): any[] {
    const result1 = [];
    const result2 = [];
    const today = moment();

    data.forEach((element) => {
      const dateTime =
        element.APPOINTMENT_DATE + ' ' + element.APPOINTMENT_TIME;

      element.APPOINTMENT_DATE = moment(
        new Date(element.APPOINTMENT_DATE)
      ).format('DD MMM yyyy');
      if (!element.PRESCRIPTION_ID || element.PRESCRIPTION_ID == '0') {
        //previous logic
        // if (moment(dateTime, 'YYYY-MM-DD hh:mm A').isSame(today, 'day')) { // new Logic
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
  /*** Intiate User Call ***/
  callUser(people: any): void {
    const user = {
      name: people.RN_CUSTOMER_FIRST_NAME + ' ' + people.RN_CUSTOMER_LAST_NAME,
      image: people.ImageBase64,
      userType: 0,
      mobile: people.RN_CUSTOMER_MOBILE,
    };
    this.user.setCallUser(user);
  }
  changeTab(tab) {
    if (tab) {
      this.getAppointments2();
    } else {
      this.getAppointments();
    }
  }
}
