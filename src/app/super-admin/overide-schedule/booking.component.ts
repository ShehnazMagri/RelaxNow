import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';
const now = new Date();
@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
})
export class BookingComponent implements OnInit {
  selectedInterval = 60;
  doctorId = 0;
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

  public selectedDate(value: any, datepicker?: any) {
    // any object can be passed to the selected event and it will be passed back here
    datepicker.start = value.start;
    datepicker.end = value.end;

    // use passed valuable to update state
    this.daterange.start = value.start;
    this.daterange.end = value.end;
    this.daterange.label = value.label;
  }

  constructor(
    private route: ActivatedRoute,
    private user: UserService,
    private router: Router,
    private http: HttpService,
    private modalService: BsModalService,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.user.getUserToken;

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
  selectSlot(slot: any): void {
    if (slot.available && !slot.cancelled && !slot.adHoc) {
      if (slot.id !== this.selectedSlot) {
        this.selectedSlot = slot.id;
        localStorage.setItem(
          'slotData',
          JSON.stringify({ time: this.currentDate.format('LL'), slot })
        );
      } else {
        this.selectedSlot = 0;
        localStorage.removeItem('slotData');
      }
    }
  }

  /*** Change Week Range ***/
  changeWeek(type: string): void {
    let currentDate = moment();
    if (type === 'next') {
      currentDate = this.currentDate.add(7, 'd');
    } else {
      currentDate = this.currentDate.subtract(7, 'd');

      if (currentDate.isBefore(this.today, 'day')) {
        this.currentDate.add(7, 'd');
        return;
      }
    }
    this.selectDate(currentDate);
  }
  /*** Select Date in Week ***/
  selectDate(date: moment.Moment): void {
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
    if (date.isBefore(this.today)) {
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

  bookSlot(): void {
    if (this.selectedSlot) {
      this.router.navigate(['/patients/checkout'], {
        queryParams: { id: this.doctorId },
      });
    }
  }

  openModal(template: TemplateRef<any>): void {
    const totalSlots = this.currentSlots.length;
    if (totalSlots) {
      this.openTime = moment(this.currentSlots[0].FROM, 'hh:mm A').format(
        'HH:mm'
      );
      this.closeTime = moment(
        this.currentSlots[totalSlots - 1].TO,
        'hh:mm A'
      ).format('HH:mm');
    } else {
      this.openTime = '10:00';
      this.closeTime = '18:00';
    }
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
  }

  close() {
    this.modalRef.hide();
  }

  submitRange(form: NgForm): void {
    this.isSubmitted = true;
    setTimeout(() => {
      this.isSubmitted = false;
    }, 10000);
    if (form.valid) {
      debugger;
      var fromDate = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
      var fromDateTime = new Date(fromDate + ' ' + this.openTime);
      if (fromDateTime < new Date()) {
        this.message.showError('Please select time greater than current time');
        return;
      }
      if (this.openTime >= this.closeTime) {
        this.message.showError('End time must be greater than start time');
        return;
      }
      this.generateSlots();
    }
  }

  generateSlots(): void {
    // Data
    const x = {
      slotInterval: this.selectedInterval,
      openTime: this.openTime,
      closeTime: this.closeTime,
    };

    // Format the time
    const startTime = moment(x.openTime, 'hh:mm');

    // Format the end time and the next day to it
    // const endTime = moment(x.closeTime, 'hh:mm').add(1, 'days');
    const endTime = moment(x.closeTime, 'hh:mm');

    // Times
    const allTimes = [];

    // Loop over the times - only pushes time with 30 minutes interval
    while (startTime < endTime) {
      // Push times
      allTimes.push({
        FROM: startTime.format('hh:mm A'),
        TO: startTime.add(x.slotInterval, 'minutes').format('hh:mm A'),
      });
    }
    this.currentSlotsSubmit = allTimes;
    this.checkAnyAppointmentExsists();
  }

  saveUserSlots(): void {
    var startDate = moment(
      `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`
    );
    var endDate = moment(
      `${this.toDate.year}-${this.toDate.month}-${this.toDate.day}`
    );
    var _now = startDate.clone(),
      dates = [];
    var allSlots = [];
    while (_now.isSameOrBefore(endDate)) {
      allSlots.push({
        day: _now.format('YYYY-MM-DD'),
        timeSlots: this.currentSlotsSubmit,
      });
      dates.push(_now.format('YYYY-MM-DD'));
      _now.add(1, 'days');
    }

    const params = {
      peopleId: this.doctorId,
      slots: allSlots,
    };

    this.http.postData(ApiUrl.admin.addSlotOveride, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.onUserChange();
          this.modalRef.hide();
          this.message.showSuccess('Slots updated successfully!');
        }
      },
      (error) => console.log(error)
    );
  }
  checkAnyAppointmentExsists() {
    const params2 = {
      query: `call RN_CHECK_APPOINTMENT_EXISTS('${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}','${this.toDate.year}-${this.toDate.month}-${this.toDate.day}',${this.doctorId})`,
      params: '',
    };
    this.http.postData(ApiUrl.queryExecute, params2).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          if (resp.data[0].AppointmentCount > 0) {
            this.message.showError(
              'Please delete or cancel the slots available between the selected time slots.'
            );
            return;
          }
          this.saveUserSlots();
        }
      },
      (error) => console.log(error)
    );
  }
}
