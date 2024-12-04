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
  styleUrls: ['./scheduletiming.component.css']
})
export class ScheduletimingComponent implements OnInit {

  selectedInterval = 30;
  selectedUserId = 50;
  weekDays: any = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
  ];
  currentSlots: any = [];
  selectedDay = 'SUNDAY';
  currentDayIndex = 0;
  userData = [];
  openTime;
  closeTime;
  modalRef: BsModalRef;

  constructor(    
    private modalService: BsModalService,
    private http: HttpService,
    private message: MessageService
  ) { }

  ngOnInit(): void {
    this.getSelectedDaySlots('SUNDAY');
  }

  getSelectedDaySlots(day: string): void {
    this.selectedDay = day;
    const params = {
      query: `call RN_EWI_PEOPLE_GET_AVAILABILITY(${this.selectedUserId},'${day}')`,
      params: ''
    };
    this.currentSlots = [];
    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result = resp.data && resp.data.length ? resp.data : [];
          result.forEach(element => {
            this.currentSlots.push({ FROM: element.START_TIME, TO: element.END_TIME });
          });
        }
      },
      (error) => (console.log(error))
    );
  }
 
}
