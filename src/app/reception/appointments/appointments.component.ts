import { element } from 'protractor';
import { MessageService } from 'src/app/core/services/message/message.service';
import { HttpService } from './../../core/services/http/http.service';
import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import 'datatables.net';
import { ApiUrl } from 'src/app/core/apiUrl';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { LoaderService } from 'src/app/core/services/loader/loader.service';
import * as moment from 'moment';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit, OnDestroy {
  public appointments = [];
  daterange: any = {};
  currentDate = new Date();
  options: any = {
    locale: { format: 'YYYY-MM-DD' },
    alwaysShowCalendars: false,
  };

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  constructor(
    private http: HttpService,
    private loader: LoaderService,
    private msg: MessageService
  ) {}

  ngOnInit(): void {
    this.getAppointments();
  }
  // ngAfterViewInit(): void {
  //   this.dtTrigger.next();
  // }
  getAppointments(): void {
    const params = {
      query: `Call RN_DOCTOR_APPOINTMENTS_BY_DATE(0,'${moment(
        this.daterange.start
      ).format('YYYY-MM-DD')}','${moment(this.daterange.end).format(
        'YYYY-MM-DD'
      )}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        this.loader.show();
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          debugger;
          this.appointments = this.sortAppointments(result);

          this.appointments.forEach((element) => {
            element.APPOINTMENT_DATE = new Date(element.APPOINTMENT_DATE);
          });
          // this.rerender();
          this.loader.hide();
        } else {
          this.loader.hide();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Confirm Cancel Appointment ***/
  confirm(selectedAppointment, type): void {
    const params = {
      Patient_Name:
        selectedAppointment.RN_CUSTOMER_FIRST_NAME +
        ' ' +
        selectedAppointment.RN_CUSTOMER_LAST_NAME,
      Email: selectedAppointment.RN_CUSTOMER_EMAIL,
      Template_Name: 'APPOINTMENT_CANCELED',
      Dr_Name:
        selectedAppointment.DOCTOR_Prefix +
        ' ' +
        selectedAppointment.DOCTOR_FIRST_NAME +
        ' ' +
        selectedAppointment.DOCTOR_LAST_NAME,
      Date_Time:
        selectedAppointment.APPOINTMENT_DATE +
        ' ' +
        selectedAppointment.APPOINTMENT_TIME,
      Reason_Unavailability: 'Unavailable',
    };
    this.msg.confirm('change the status of an Appointment').then((data) => {
      if (data.value) {
        this.http.postData(ApiUrl.email, params).subscribe(
          (resp: any) => {
            if (!!resp) {
              const params2 = {
                query: `call RN_CANCEL_APPOINTMENT(${selectedAppointment.RN_APPOINTMENT_ID},${type})`,
                params: '',
              };
              this.http.postData(ApiUrl.queryExecute, params2).subscribe(
                (resp: any) => {
                  if (!!resp) {
                    this.getAppointments();
                    this.msg.showSuccess('Status Changed Successfully');
                    // window.location.reload();
                  }
                },
                (error) => console.log(error)
              );
            }
          },
          (error) => console.log(error)
        );
      } else {
        this.getAppointments();
      }
    });
  }

  /*** Confirm Cancel Appointment ***/
  cancelAppointment(selectedAppointment): void {
    debugger;
    this.msg.confirm('Cancel Appointment').then(
      (data) => {
        if (data.value) {
          const params2 = {
            query: `call RN_UPDATE_APPOINTMENT_PAYMENT_STATUS(${selectedAppointment.RN_APPOINTMENT_ID},2)`,
            params: '',
          };
          this.http.postData(ApiUrl.queryExecute, params2).subscribe(
            (resp: any) => {
              if (!!resp) {
                this.sendAppointmentCanceledMail(selectedAppointment);
                this.getAppointments();
                this.msg.showSuccess('Appointment Cancelled Successfully');
              }
            },
            (error) => console.log(error)
          );
        }
      },
      (error) => console.log(error)
    );
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
    this.getAppointments();
  }
  /*** Sort Array by prescription and date ***/
  sortAppointments(data): any[] {
    this.loader.show();

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

    setTimeout(() => {
      this.loader.hide();
    }, 100);
    return result1.concat(result2);
  }
  /*** UnSubscribe the events to prevent memory leakage ***/
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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  sendAppointmentCanceledMail(selectedAppointment): void {
    const params = {
      Patient_Name:
        selectedAppointment.RN_CUSTOMER_FIRST_NAME +
        ' ' +
        selectedAppointment.RN_CUSTOMER_LAST_NAME,
      Email: selectedAppointment.RN_CUSTOMER_EMAIL,
      Template_Name: 'APPOINTMENT_CANCELED',
      Dr_Name:
        selectedAppointment.DOCTOR_Prefix +
        ' ' +
        selectedAppointment.DOCTOR_Prefix +
        ' ' +
        selectedAppointment.DOCTOR_FIRST_NAME +
        ' ' +
        selectedAppointment.DOCTOR.LAST_NAME,
      Date_Time:
        selectedAppointment.APPOINTMENT_DATE +
        ' ' +
        selectedAppointment.APPOINTMENT_TIME,
    };
    this.http.postData(ApiUrl.email, params).subscribe((resp: any) => {
      if (!!resp) {
      }
    });
  }
}
