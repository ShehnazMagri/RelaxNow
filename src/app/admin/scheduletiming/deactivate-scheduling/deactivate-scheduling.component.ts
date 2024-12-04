import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
const now = new Date();

@Component({
  selector: 'app-deactivate-scheduling',
  templateUrl: './deactivate-scheduling.component.html',
  styleUrls: ['./deactivate-scheduling.component.css'],
})
export class DeactivateSchedulingComponent implements OnInit {
  peopleId;
  peopleName = '';
  reason = '';
  model: NgbDateStruct;
  currentSlots = [];
  selectedSlots = [];
  adHocSlots = [];
  modalRef: BsModalRef;
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';
  selectedInterval = 60;
  openTime;
  closeTime;
  isSubmitted = false;

  maxDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };

  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private msg: MessageService,
    private route: ActivatedRoute,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.peopleId = this.route.snapshot.paramMap.get('id');
    if (this.peopleId) {
      this.getUserProfile();
    }
  }

  getSchedule(): void {
    const selectedDate =
      this.model.year +
      '-' +
      (this.model.month > 9 ? this.model.month : '0' + this.model.month) +
      '-' +
      (this.model.day > 9 ? this.model.day : '0' + this.model.day);
    const params = {
      query: `Call RN_GET_SCHEDULE('${this.peopleId}','${selectedDate}')`,
      params: '',
    };
    debugger;
    this.executeRequest(params, 'schedule');
  }

  /*** Get User Profile ***/
  getUserProfile(): void {
    const params = {
      query: `Call RN_PEOPLE_GET_BYID(${this.peopleId})`,
      params: '',
    };
    this.executeRequest(params, 'profile');
  }
  /*** Execute Procedular query  ***/
  executeRequest(params: any, type: string = ''): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (type === 'profile' && resp.data && resp.data[0].result) {
            this.peopleName =
              resp.data[0].result[0].FIRST_NAME +
              ' ' +
              resp.data[0].result[0].LAST_NAME;
          }
          if (type === 'schedule' && resp.data && resp.data[0].result) {
            this.selectedSlots = [];
            this.adHocSlots = [];
            this.currentSlots = resp.data[0].result;
            this.currentSlots.map((v) => {
              if (v.STATUS === null) {
                v.STATUS = 1;
              }
            });
          }
          if (type === 'deactivate' || type === 'adHoc') {
            this.modalRef.hide();
            this.msg.showSuccess('Slots are updated successfully!');
            this.getSchedule();
          }
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Open Modal ***/
  openModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    this.reason = '';
  }

  deactivaeSlots() {
    if (!this.selectedSlots.length) {
      this.message.showError('Please select atleast one slot to deativate');
      return;
    }
    const slotIds = this.selectedSlots;
    const allSlots = slotIds.length ? slotIds.join(',') : 0;
    const appointments = [];
    this.currentSlots.forEach((v) => {
      if (this.selectedSlots.includes(v.SlotIdID) && v.APPOINTMENT_ID) {
        appointments.push(v.APPOINTMENT_ID);
      }
    });
    const selectedDate =
      this.model.year +
      '-' +
      (this.model.month > 9 ? this.model.month : '0' + this.model.month) +
      '-' +
      (this.model.day > 9 ? this.model.day : '0' + this.model.day);
    const params = {
      query: `Call RN_PEOPLE_EXCEPTION_AVAILABILITY_INSERT('${allSlots}','${selectedDate}','0','${this.reason}','${this.modifiedBy}',1)`,
      params: '',
    };
    if (appointments.length) {
      const params2 = {
        query: `Call RN_DEACTIVATE_SCHEDULE('${appointments.join(',')}','0','${
          this.reason
        }','${this.modifiedBy}')`,
        params: '',
      };
      this.executeRequest(params2, 'deactivate2');
    }
    this.modalRef.hide();
    // localStorage.setItem('cancelledSlots', JSON.stringify(slotIds));
    this.executeRequest(params, 'deactivate');
  }

  addAdhocSlots() {
    if (!this.adHocSlots.length) {
      this.message.showError(
        'Please select atleast one slot to add Ad HOC slot'
      );
      return;
    }
    const slotIds = this.adHocSlots;
    const allSlots = slotIds.length ? slotIds.join(',') : 0;
    const params = {
      query: `Call RN_PEOPLE_EXCEPTION_AVAILABILITY_UPDATE('${allSlots}',2,'${this.reason}','${this.modifiedBy}')`,
      params: '',
    };
    this.modalRef.hide();
    localStorage.setItem('adhocslots', JSON.stringify(slotIds));
    this.getSchedule();
    this.executeRequest(params, 'adHoc');
  }

  selectSlot(slot, exceptionId): void {
    if (slot.STATUS === 2) {
      return;
    }
    if (exceptionId) {
      const index = this.adHocSlots.indexOf(exceptionId);
      if (index > -1) {
        this.adHocSlots.splice(index, 1);
      } else {
        this.adHocSlots.push(exceptionId);
      }
    } else {
      const index = this.selectedSlots.indexOf(slot.SlotId);
      if (index > -1) {
        this.selectedSlots.splice(index, 1);
      } else {
        this.selectedSlots.push(slot.SlotId);
      }
    }
  }

  /*** Cancel ***/
  close() {
    this.modalRef.hide();
  }
}
