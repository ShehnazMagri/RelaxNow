import { element } from 'protractor';
import { MessageService } from 'src/app/core/services/message/message.service';
import { HttpService } from '../../core/services/http/http.service';
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
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pending-appointments',
  templateUrl: './pending-appointments.component.html',
  styleUrls: ['./pending-appointments.component.css'],
})
export class PendingAppointmentsComponent implements OnInit, OnDestroy {
  modalRef: BsModalRef;
  selectedSlot = 0;
  doctorName = '';
  public appointments = [];
  daterange: any = {};
  currentDate = new Date();
  fromDate: NgbDateStruct;
  options: any = {
    locale: { format: 'YYYY-MM-DD' },
    alwaysShowCalendars: false,
    minDate: this.currentDate,
  };

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  todayCurrentDate = new Date();
  today = moment();
  currentSlots = [];
  doctorId = 0;
  selectedAppointment: any;
  constructor(
    private http: HttpService,
    private loader: LoaderService,
    private msg: MessageService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.getAppointments();
  }
  // ngAfterViewInit(): void {
  //   this.dtTrigger.next();
  // }
  getAppointments(): void {
    const params = {
      query: `Call RN_DOCTOR_PENDING_APPOINTMENTS_BY_DATE(0,'${moment(
        this.daterange.start
      ).format('YYYY-MM-DD')}','${moment(this.daterange.end).format(
        'YYYY-MM-DD'
      )}')`,
      params: '',
    };
    debugger;
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        this.loader.show();
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          // result.forEach((element) => {
          //   if (
          //     moment(element.APPOINTMENT_DATE, 'YYYY-MM-DD').isSame(
          //       this.today,
          //       'day'
          //     )
          //   ) {
          //     if (
          //       this.today.isBefore(moment(element.APPOINTMENT_TIME, 'hh:mm A'))
          //     ) {
          //       this.appointments.push(element);
          //     }
          //   } else {
          //     this.appointments.push(element);
          //   }
          // });
          this.appointments = this.sortAppointments(result);
          this.appointments.forEach((element) => {
            debugger;
            element.CheckForDate = new Date(
              element.APPOINTMENT_DATE + ' ' + element.APPOINTMENT_TIME
            );
            element.APPOINTMENT_DATE = new Date(element.APPOINTMENT_DATE);
          });
          // this.appointments = this.appointments.filter(
          //   (x) =>
          //     new Date(x.APPOINTMENT_DATE + ' ' + x.APPOINTMENT_TIME) >
          //     new Date()
          // );
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
  cashPayment(selectedAppointment): void {
    this.msg
      .confirmAppointment('Approve Appointment', selectedAppointment.AMOUNT)
      .then(
        (data) => {
          if (data.value) {
            debugger;
            const params2 = {
              appointment_id: selectedAppointment.RN_APPOINTMENT_ID,
              amount: selectedAppointment.AMOUNT,
              productinfo: 'Cash Payment',
              firstname: selectedAppointment.RN_CUSTOMER_FIRST_NAME,
              Description: data.value,
              schedule_id:selectedAppointment.SCHEDULE_ID
            };
            this.http
              .postData(`/payu/generate-cash-payment-admin`, params2)
              .subscribe(
                (resp: any) => {
                  if (!!resp) {
                    debugger;
                    if(resp.message=='Slot-booked')
                    {
                      this.msg.showError('Slot is already booked. Please choose another slot.');
                      return;
                    }
                    this.getAppointments();
                    this.msg.showSuccess('Appointment Confirmed Successfully');
                  }
                },
                (error) => console.log(error)
              );
          }
        },
        (error) => console.log(error)
      );
  }

  DeleteAppointment(selectedAppointment): void {
    this.msg.confirm('Delete Appointment').then(
      (data) => {
        if (data.value) {
          const params2 = {
            query: `call RN_DELETE_APPOINTMENT(${selectedAppointment.RN_APPOINTMENT_ID})`,
            params: '',
          };
          this.http.postData(ApiUrl.queryExecute, params2).subscribe(
            (resp: any) => {
              if (!!resp) {
                this.getAppointments();
                this.msg.showSuccess('Appointment Deleted Successfully');
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

  getSchedule(): void {
    const day =
      this.fromDate.year +
      '-' +
      (this.fromDate.month > 9
        ? this.fromDate.month
        : '0' + this.fromDate.month) +
      '-' +
      (this.fromDate.day > 9 ? this.fromDate.day : '0' + this.fromDate.day);
    const params = {
      peopleId: this.doctorId,
      date: day,
    };
    this.currentSlots = [];
    this.http.postData(ApiUrl.peopleSchedule, params).subscribe(
      (resp: any) => {
        if (!!resp && resp.data) {
          const result = resp.data.length ? resp.data : [];
          result.forEach((element) => {
            let data = {};
            console.log(element);

            if (moment(day, 'YYYY-MM-DD').isSame(this.today, 'day')) {
              if (this.today.isBefore(moment(element.END_TIME, 'hh:mm A'))) {
                data = {
                  id: element.SlotId,
                  available: !element.APPOINTMENT_STATUS,
                  cancelled: element.STATUS == 0,
                  adHoc: element.STATUS == 2,
                  from: element.START_TIME,
                  to: element.END_TIME,
                  MonthData: element.MonthData,
                };
                this.currentSlots.push(data);
              }
            } else {
              data = {
                id: element.SlotId,
                available: !element.APPOINTMENT_STATUS,
                cancelled: element.STATUS == 0,
                adHoc: element.STATUS == 2,
                from: element.START_TIME,
                to: element.END_TIME,
                MonthData: element.MonthData,
              };

              this.currentSlots.push(data);
            }
          });
          debugger;
        }
      },
      (error) => console.log(error)
    );
  }
  openModal(template: TemplateRef<any>, item): void {
    this.selectedAppointment = item;
    this.doctorId = item.PEOPLE_ID;
    this.doctorName =
      item.DOCTOR_Prefix +
      ' ' +
      item.DOCTOR_FIRST_NAME +
      ' ' +
      item.DOCTOR_LAST_NAME;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
  }
  getAppointmentSlotsCount(): void {
    const params2 = {
      query: `call RN_GET_APPOINTMENT_SLOTS_COUNT(${this.selectedAppointment.RN_APPOINTMENT_ID})`,
      params: '',
    };
    this.http.postData(ApiUrl.queryExecute, params2).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          if (resp.data[0].SLOTS > 1) {
            this.msg.showError(
              'This appointment contain multiple slots. It cannot be transfered please delete/cancel this appointment and create new.'
            );
          } else {
            this.transfer();
          }
        }
      },
      (error) => console.log(error)
    );
  }
  transfer() {
    debugger;
    var date = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
    var selectedSlot = this.currentSlots.find((x) => x.id == this.selectedSlot);
    const params2 = {
      query: `call RN_TRANSFER_APPOINTMENT('${date}','${selectedSlot.from}','${selectedSlot.to}','${selectedSlot.id}',${this.selectedAppointment.RN_APPOINTMENT_ID})`,
      params: '',
    };
    this.http.postData(ApiUrl.queryExecute, params2).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.modalRef.hide();
          this.msg.showSuccess('Appointment transfered successfully.');
        }
      },
      (error) => console.log(error)
    );
  }
}
