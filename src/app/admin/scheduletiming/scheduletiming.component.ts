import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';

@Component({
  selector: 'app-scheduletiming',
  templateUrl: './scheduletiming.component.html',
  styleUrls: ['./scheduletiming.component.css'],
})
export class ScheduletimingComponent implements OnInit {
  selectedInterval = 60;
  selectedUserId = 0;
  weekDays: any = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  currentSlots: any = [];
  selectedDay = '';
  currentDayIndex = 0;
  userData = [];
  openTime;
  closeTime;
  modalRef: BsModalRef;
  isSubmitted = false;

  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.getByRole();
  }

  /*** Get Users by Role ***/
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
        }
      },
      (error) => console.log(error)
    );
  }
  getSelectedDaySlots(day: string): void {
    this.selectedDay = day;
    const params = {
      query: `call RN_EWI_PEOPLE_GET_AVAILABILITY(${this.selectedUserId},'${day}')`,
      params: '',
    };
    this.currentSlots = [];
    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result = resp.data && resp.data.length ? resp.data : [];
          result.forEach((element) => {
            this.currentSlots.push({
              FROM: element.START_TIME,
              TO: element.END_TIME,
            });
          });
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Generate Slots ***/
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
    this.currentSlots = allTimes;
    this.modalRef.hide();
    this.saveUserSlots();
  }

  /*** Submit Slots ***/
  submitRange(form: NgForm): void {
    this.isSubmitted = true;
    setTimeout(() => {
      this.isSubmitted = false;
    }, 10000);
    if (form.valid) {
      if (this.openTime >= this.closeTime) {
        this.message.showError('End time must be greater than start time');
        return;
      }
      this.generateSlots();
    }
  }

  /*** Remove Slots ***/
  removeSlot(slot: number): void {
    this.currentSlots.splice(slot, 1);
    this.saveUserSlots();
  }

  /*** Open Add/Edit Slots Modal ***/
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

  /*** On Changing User ***/
  onUserChange(): void {
    if (this.selectedDay) {
      this.getSelectedDaySlots(this.selectedDay);
    }
  }

  /*** copy to all weekends user Slots ***/
  copySameSlots(): void {
    const slots = [];
    this.weekDays.forEach(async (element) => {
      await slots.push({ day: element, timeSlots: this.currentSlots });
    });
    const params = {
      peopleId: this.selectedUserId,
      slots,
    };
    this.http.postData(ApiUrl.admin.addSlot, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.message.showSuccess('Slots updated successfully!');
        }
      },
      (error) => console.log(error)
    );
  }
  /*** Save user Slots ***/
  saveUserSlots(): void {
    const params = {
      peopleId: this.selectedUserId,
      slots: [{ day: this.selectedDay, timeSlots: this.currentSlots }],
    };

    this.http.postData(ApiUrl.admin.addSlot, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.message.showSuccess('Slots updated successfully!');
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Close Modal ***/
  close() {
    this.modalRef.hide();
  }
}
