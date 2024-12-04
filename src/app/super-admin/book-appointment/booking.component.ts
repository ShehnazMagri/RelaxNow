import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClipboardService } from 'ngx-clipboard';
import { ApiUrl, CheckoutURL, TestURL } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';
const now = new Date();
var CryptoJS = require('crypto-js');
@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
})
export class BookingComponent implements OnInit {
  selectedSlotsIndex = [];
  registerForm = new FormGroup({});
  selectedInterval = 60;
  doctorId = 0;
  patientId = 0;
  doctorDetails: any = {};
  doctorImage = '';
  selectedStartWeek = moment().startOf('isoWeek');
  selectedEndWeek = moment().endOf('isoWeek');
  today = moment();
  currentDate = moment();
  todayCurrentDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  doctorName = '';
  weekDays: Array<any> = [];
  currentSlots: any = [];
  currentSlotsSubmit = [];
  selectedDay = '';
  selectedSlot = 0;
  public daterange: any = {};
  isLoggedIn = false;
  userData = [];
  public patients = [];
  openTime;
  closeTime;
  modalRef: BsModalRef;
  isSubmitted = false;
  fromDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  toDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  // see original project for full list of options
  // can also be setup using the config service to apply to multiple pickers
  public options: any = {
    locale: { format: 'YYYY-MM-DD' },
    alwaysShowCalendars: false,
  };
  public selectedSlots = [];
  public selectedDate(value: any, datepicker?: any) {
    // any object can be passed to the selected event and it will be passed back here
    datepicker.start = value.start;
    datepicker.end = value.end;

    // use passed valuable to update state
    this.daterange.start = value.start;
    this.daterange.end = value.end;
    this.daterange.label = value.label;
  }
  public appointments;
  public totalAmount = 0;
  emailPattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/);
  telPattern = new RegExp(
    /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
  );
  constructor(
    private route: ActivatedRoute,
    private user: UserService,
    private router: Router,
    private http: HttpService,
    private modalService: BsModalService,
    private message: MessageService,
    private _clipboardService: ClipboardService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.user.getUserToken;
    this.getPatients();
    this.getByRole();
  }

  getByRole(): void {
    const params = {
      query: 'Call RN_PEOPLE_GET_Consultants()',
      params: '',
    };
    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result = resp.data && resp.data.length ? resp.data : [];
          this.userData = result;
          var id = this.route.snapshot.paramMap.get('id');
          if (id) {
            this.doctorId = parseInt(id);
            this.onUserChange();
          }
        }
      },
      (error) => console.log(error)
    );
  }
  onUserChange() {
    var selectedUser = this.userData.find((x) => x.ID == this.doctorId);
    this.doctorName = selectedUser.FIRST_NAME + ' ' + selectedUser.LAST_NAME;
    this.totalAmount = selectedUser.FIRST_CONSULTATION_FEE;
    this.totalAmount = Number(this.totalAmount.toFixed(2));
    this.selectDate(this.currentDate);
  }

  /*** Select Slot for booking ***/
  getSelectedDaySlots(day: string): void {
    this.selectedDay = day;
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
          if (localStorage.getItem('slotData')) {
            const slotData = JSON.parse(localStorage.getItem('slotData'));
            this.selectedSlot = slotData.slot.id;
            console.log(slotData);
          }
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Change Week Range ***/
  changeWeek(type: string): void {
    debugger;
    let currentDate = moment();
    if (type === 'next') {
      currentDate = this.currentDate.add(7, 'd');
    } else {
      currentDate = this.currentDate.subtract(7, 'd');

      if (currentDate.isBefore(this.today, 'day')) {
        currentDate = this.today;
        // this.currentDate.add(7, 'd');
        // return;
      }
    }
    this.selectDate(currentDate);
  }
  /*** Select Date in Week ***/
  selectDate(date: moment.Moment): void {
    this.selectedSlotsIndex = [];
    this.selectedSlots = [];
    this.currentDate = moment(date);
    this.selectedStartWeek = moment(this.currentDate).startOf('isoWeek');
    this.selectedEndWeek = moment(this.currentDate).endOf('isoWeek');
    // this.selectedWeek = `${this.selectedStartWeek.format('DD MMM')} - ${this.selectedEndWeek.format('DD MMM, YYYY')}`;
    this.weekDays = this.generateWeek(
      this.selectedStartWeek,
      this.selectedEndWeek
    );
    this.getSelectedDaySlots(this.currentDate.format('YYYY-MM-DD'));
    this.selectedSlot = 0;
    localStorage.removeItem('slotData');
  }
  /*** Select Day ***/
  selectWeekDay(date: moment.Moment): void {
    if (
      date.isBefore(this.today) &&
      moment(date).format('YYYY-MM-DD') !=
        moment(this.today).format('YYYY-MM-DD')
    ) {
      return;
    }
    this.currentDate = date;
    this.selectDate(date);
  }

  /*** Generate Weekdays  ***/
  generateWeek(startDate: moment.Moment, endDate: moment.Moment): Array<any> {
    const dates = [];

    const currDate = moment(startDate).subtract(1, 'days');

    while (currDate.add(1, 'days').diff(endDate) < 0) {
      dates.push({
        selected: this.isSelected(currDate),
        mDate: currDate.clone(),
      });
    }

    return dates;
  }
  /*** Check same day  ***/
  isSelected(date: moment.Moment): boolean {
    if (!!this.currentDate) {
      return (
        this.currentDate.format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
      );
    }
    return false;
  }

  close() {
    this.modalRef.hide();
  }

  bookAppointment(): void {
    this.message.confirm('book appointment').then((data) => {
      if (data.value) {
        this.booking();
      }
    });
  }

  getPatients() {
    const params = {
      query: 'call RN_CUSTOMER_GET_ALL()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.patients = result;
        }
      },
      (error) => console.log(error)
    );
  }

  //************************** */

  booking() {
    // const params2 = {
    //   query: `Call RN_APPOINTMENT_INSERT('${this.doctorDetails.ID}','${this.userData.USERID}','${moment().format('YYYY-MM-DD')}','${moment(this.appointments.time, 'LL').format('YYYY-MM-DD')}','${this.appointments.slot.from}','${moment(this.appointments.time, 'LL').format('YYYY-MM-DD')}','${moment(this.appointments.time, 'LL').format('YYYY-MM-DD')}','1','Cash','${this.doctorProfile.FIRST_CONSULTATION_FEE}','${moment().format('YYYY-MM-DD')}','1','1','${moment().format('YYYY-MM-DD')}','1','1','${localStorage.getItem('twilioToken')}','${this.appointments.slot.to} )`,
    //   params: ''
    // };
    var lastIndex = this.selectedSlotsIndex[this.selectedSlotsIndex.length - 1];
    this.appointments.slot.from =
      this.currentSlots[this.selectedSlotsIndex[0]].from;
    this.appointments.slot.to = this.currentSlots[lastIndex].to;
    const params2 = {
      vPEOPLE_ID: `${this.doctorId}`,
      vCUSTOMER_ID: `${this.patientId}`,
      vBOOKING_DATE: moment().format('YYYY-MM-DD HH:MM'),
      vAPPOINTMENT_DATE: moment(this.appointments.time, 'LL').format(
        'YYYY-MM-DD'
      ),
      vAPPOINTMENT_TIME: this.appointments.slot.from, //moment(this.appointments.slot.from, 'hh:mm A').format('HH:mm'),
      vFOLLOWUP_DATE: moment(this.appointments.time, 'LL').format('YYYY-MM-DD'),
      vFOLLOWUP_TIME: `${this.appointments.slot.from}`,
      vSTATUS: '1',
      vPAYMENT_TYPE: '1',
      vPAYMENT_AMMOUNT:
        Number(this.totalAmount.toFixed(2)) * this.selectedSlots.length,
      vPAYMENT_DATE: moment().format('YYYY-MM-DD'),
      vPAYMENT_RECEIPT: '1',
      vMODIFIED_Date: moment().format('YYYY-MM-DD'),
      vACTIVE: '1',
      vREASON: '1',
      vAPPOINTMENT_ENDTIME: this.appointments.slot.to, //moment(this.appointments.slot.to, 'hh:mm A').format('HH:mm'),
      SCHEDULE_ID: `${this.appointments.slot.id}`,
    };
    this.http.postData(ApiUrl.createChatRoom, params2).subscribe((response) => {
      if (!!response) {
        debugger;
        this.insertAppointmentSlots(response.data.APPOINTMENT_ID);
      }
    });
  }

  insertAppointmentSlots(appointmentId): void {
    debugger;
    const params = {
      slots: this.selectedSlots,
      Appointment_Id: appointmentId,
    };
    this.http
      .postData('/people/Insert-appointment-slots', params)
      .subscribe((resp: any) => {
        var url = CryptoJS.AES.encrypt(
          appointmentId.toString(),
          '@Test'
        ).toString();
        url = url.replaceAll('+', 'xMl3Jk');
        url = url.replaceAll('/', 'Por21Ld');
        url = url.replaceAll('=', 'Ml32');
        url = CheckoutURL + url;
        this.sendAppointmentPreBookedEmailMail(url);
        this.message
          .GeneriicAppointment(
            `<div style="text-align: center;word-wrap: break-word;width: 600;">Appointment is booked. URL for payment:<br/> ${url}</div>`
          )
          .then((data) => {
            if (data.value) {
              this.copy(url);
            }
          });
        if (!!resp) {
        }
      });
  }

  copy(url) {
    this._clipboardService.copy(url);
    this.message.showSuccess('Url copied to clipboard');
  }

  sendAppointmentPreBookedEmailMail(url): void {
    this.selectedSlotsIndex = [];
    this.selectedSlots = [];
    var selectedPatient = this.patients.find((x) => x.ID == this.patientId);
    var selectedDoctor = this.userData.find((x) => x.ID == this.doctorId);
    const params = {
      Patient_Name: selectedPatient.FIRST_NAME + selectedPatient.LAST_NAME,
      Email: selectedPatient.EMAIL,
      Template_Name: 'APPOINTMENT_DETAILS_P',
      Dr_Name:
        selectedDoctor.Prefix +
        ' ' +
        selectedDoctor.FIRST_NAME +
        ' ' +
        selectedDoctor.MIDDLE_NAME +
        ' ' +
        selectedDoctor.LAST_NAME,
      Date_Time:
        moment(this.appointments.time, 'LL').format('YYYY-MM-DD') +
        ' ' +
        this.appointments.slot.from,
      paymentURL: url,
    };
    this.http.postData(ApiUrl.email, params).subscribe((resp: any) => {
      if (!!resp) {
      }
    });
  }

  // sendAppointmentMail(): void {
  //   const params = {
  //     Patient_Name: this.firstName + this.lastName,
  //     Email: this.email,
  //     Template_Name: 'APPOINTMENT_DETAILS',
  //     Dr_Name:
  //       this.doctorDetails.Prefix +
  //       ' ' +
  //       this.doctorDetails.FIRST_NAME +
  //       ' ' +
  //       this.doctorDetails.MIDDLE_NAME +
  //       ' ' +
  //       this.doctorDetails.LAST_NAME,
  //     Date_Time: this.appointments.time + ' ' + this.appointments.slot.from,
  //     Appointment_Id: this.appointmentId,
  //   };
  //   this.http.postData(ApiUrl.email, params).subscribe((resp: any) => {
  //     if (!!resp) {
  //     }
  //   });
  // }

  createSignupForm() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern(this.telPattern)]],
      mEmail: [
        '',
        [Validators.required, Validators.pattern(this.emailPattern)],
      ],
      password: ['', [Validators.required]],
      mName: [''],
      lName: ['', [Validators.required]],
      gender: ['', [Validators.required]],
    });
  }
  signup() {
    this.isSubmitted = true;

    if (!this.registerForm.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }

    this.register();
  }

  register() {
    const formData = this.registerForm.value;
    this.executeRequest(formData);
  }
  executeRequest(params: any): void {
    this.http.postData(`/register`, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (resp.message == 'emailerror') {
            this.message.showError('Email id already exists.');
          } else if (resp.message == 'phoneerror') {
            this.message.showError('Phone number already exists.');
          } else {
            debugger;
            this.modalRef.hide();
            this.message.showSuccess('Successfully Registered!');
            this.getPatients();
            var params2 = {
              Patient_Name: params.name,
              Email: params.mEmail,
              Template_Name: 'ACCOUNT_CREATED',
              Mobile: params.mobile,
            };
            this.http.postData(ApiUrl.email, params2).subscribe((resp: any) => {
              if (!!resp) {
              }
            });
          }
        }
      },
      (error) => console.log(error)
    );
  }

  openModal(template: TemplateRef<any>): void {
    this.createSignupForm();
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    this.isSubmitted = false;
  }

  selectSlot(slot: any, selectedIndex): void {
    if (slot.available && !slot.cancelled && !slot.adHoc) {
      if (this.selectedSlots.indexOf(slot.id) == -1) {
        this.selectedSlotsIndex.push(selectedIndex);
        var max = this.getMaxDifference();
        if (max <= 1) {
          this.selectedSlots.push(slot.id);
          // localStorage.setItem(
          //   'slotData',
          //   JSON.stringify({ time: this.currentDate.format('LL'), slot })
          // );
          this.appointments = { time: this.currentDate.format('LL'), slot };
        } else {
          this.selectedSlotsIndex = this.selectedSlotsIndex.filter(
            (x) => x != selectedIndex
          );
          this.message.showError('Please select adjacent slots');
        }
      } else {
        this.selectedSlots = this.selectedSlots.filter((x) => x != slot.id);
        this.selectedSlotsIndex = this.selectedSlotsIndex.filter(
          (x) => x != selectedIndex
        );
        var max = this.getMaxDifference();
        if (max > 1) {
          this.selectedSlotsIndex.push(selectedIndex);
          this.selectedSlots.push(slot.id);
          this.message.showError('you cannot remove this slot');
        }
        //  localStorage.removeItem('slotData');
      }
    }
  }

  private getMaxDifference() {
    this.selectedSlotsIndex.sort(function (a, b) {
      return a - b;
    });
    var diff = 0;
    var max = 0;
    for (var i = 0; i < this.selectedSlotsIndex.length - 1; ++i) {
      diff = Math.abs(
        this.selectedSlotsIndex[i] - this.selectedSlotsIndex[i + 1]
      );
      if (max < diff) max = diff;
    }
    return max;
  }
}
