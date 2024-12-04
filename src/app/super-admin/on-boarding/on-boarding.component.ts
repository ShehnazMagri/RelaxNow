import { MessageService } from 'src/app/core/services/message/message.service';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { OnBoardingModel } from './on-boarding.model';
const now = new Date();

@Component({
  selector: 'app-on-boarding',
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.css'],
})
export class OnBoardingComponent implements OnInit, AfterViewInit, OnDestroy {
  peopleData = [];
  isSubmitted = false;
  // Datatable Options
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = { order: [] };
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';
  enableCheck = false;
  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.getPeopleList();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
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

  getPeopleList(): void {
    const params = {
      query: "Call RN_PEOPLE_GET('',1)",
      params: '',
    };

    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.peopleData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.rerender();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  /*** Toogle Status ***/
  changeStatus(event: boolean, people: OnBoardingModel): void {
    const params = {
      query: `Call RN_PEOPLE_UPDATE_STATUS(${people.ID},${+event})`,
      params: '',
    };
    this.message.confirm('Change Status').then((data) => {
      if (data.value) {
        this.executeRequest(params);
      } else {
        this.getPeopleList();
      }
    });
  }

  /*** Execute Procedular query  ***/
  executeRequest(params: any): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (resp.data[0].result[0].ID == -1) {
            this.message.showError('Email Id already exists.');
            return;
          }
          if (resp.data[0].result[0].ID == -2) {
            this.message.showError('Phone number already exists.');
            return;
          }
          this.getPeopleList();
        }
      },
      (error) => console.log(error)
    );
  }

  updateOrder(sp, item): void {
    const params = {
      query: `Call ${sp}(${item.Order_By},${item.ID})`,
      params: '',
    };

    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getPeopleList();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
