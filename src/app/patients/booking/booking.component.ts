import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
})
export class BookingComponent implements OnInit {
  doctorId;
  doctorDetails: any = {};
  doctorImage = '';
  selectedStartWeek = moment().startOf('isoWeek');
  selectedEndWeek = moment().endOf('isoWeek');
  today = moment();
  currentDate = moment();
  weekDays: Array<any> = [];
  currentSlots: any = [];
  selectedDay = '';
  selectedSlot = 0;
  public daterange: any = {};
  isLoggedIn = false;
  public selectedSlots = [];
  public selectedSlotsIndex = [];
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
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.user.getUserToken;

    if (this.route.snapshot.queryParams['id']) {
      this.doctorId = this.route.snapshot.queryParams['id'];
      this.getDoctorProfile();
    }
    this.selectDate(this.currentDate);
  }

  /*** Get Doctor Profile ***/
  getDoctorProfile(): void {
    this.http
      .postData(ApiUrl.getPeopleInfo, { peopleId: this.doctorId })
      .subscribe(
        (resp: any) => {
          if (!!resp && resp.data) {
            const result = resp.data;
            this.doctorDetails = result;
          }
        },
        (error) => console.log(error)
      );
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
                  MonthData: element.MonthData
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
                MonthData: element.MonthData
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
    this.selectedSlotsIndex = [];
    this.selectedSlots = [];
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

  selectSlot(slot: any, selectedIndex): void {
    if (slot.available && !slot.cancelled && !slot.adHoc) {
      if (this.selectedSlots.indexOf(slot.id) == -1) {
        this.selectedSlotsIndex.push(selectedIndex);
        var max = this.getMaxDifference();
        if (max <= 1) {
          this.selectedSlots.push(slot.id);
          localStorage.setItem(
            'slotData',
            JSON.stringify({ time: this.currentDate.format('LL'), slot })
          );
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

  bookSlot(): void {
    if (this.selectedSlots.length > 0) {
      var max = this.getMaxDifference();
      if (max <= 1) {
        if (this.selectedSlotsIndex.length > 0) {
          debugger;
          var lastIndex =
            this.selectedSlotsIndex[this.selectedSlotsIndex.length - 1];
          var slotdata = JSON.parse(localStorage.getItem('slotData'));
          slotdata.slot.from =
            this.currentSlots[this.selectedSlotsIndex[0]].from;
          slotdata.slot.to = this.currentSlots[lastIndex].to;

          localStorage.setItem('slotData', JSON.stringify(slotdata));
        }
        localStorage.setItem('allSlots', JSON.stringify(this.selectedSlots));
        this.router.navigate(['/p/checkout'], {
          queryParams: { id: this.doctorId },
        });
      } else {
        this.message.showError('Please select adjacent slots');
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
