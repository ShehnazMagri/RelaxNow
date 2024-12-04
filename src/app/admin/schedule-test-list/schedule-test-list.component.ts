import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HttpService } from '../../core/services/http/http.service';
import { Component, OnInit, TemplateRef } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net';
import { ApiUrl } from 'src/app/core/apiUrl';
import { ClipboardService } from 'ngx-clipboard';
import { MessageService } from 'src/app/core/services/message/message.service';

@Component({
  selector: 'app-schedule-test-list',
  templateUrl: './schedule-test-list.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class ScheduleTestListComponent implements OnInit {
  datatable: any;
  public scheduleTestList = [];
  public testUsers = [];
  modalRef: BsModalRef;
  constructor(
    private http: HttpService,
    private _clipboardService: ClipboardService,
    private message: MessageService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.getScheduleTest();
  }

  getScheduleTest(): void {
    const params = {
      query: 'call RN_SCHEDULE_TEST_GET_ALL()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.scheduleTestList = result;
          console.log(result);
          setTimeout(() => {
            const table: any = $('table');
            this.datatable = table.DataTable();
          }, 10);
        }
      },
      (error) => console.log(error)
    );
  }

  changeStatus(type, id): void {
    //
    const params = {
      query: `call RN_UPDATE_SCHEDULE_TEST_STATUS(${id},${type})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          // this.getScheduleTest();
        }
      },
      (error) => console.log(error)
    );
  }

  copy(url, testName) {
    const copyUrl = url + '?test=' + testName.replace(/ /g, '_');
    this._clipboardService.copy(copyUrl);
    this.message.showSuccess('Url copied to clipboard');
  }

  public getScheduleTestUsers(id, template) {
    //
    const params = {
      query: `call RN_GET_SCHEDULE_TEST_USERS_LIST(${id})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.testUsers = result;
          this.openModal(template, 'testUsers');
        }
      },
      (error) => console.log(error)
    );
  }

  public getAnonymousTestUsers(id, template) {
    //
    const params = {
      query: `call RN_GET_ANONYMOUS_USER_LIST(${id})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.testUsers = result;
          this.openModal(template, 'testUsersAnonymous');
        }
      },
      (error) => console.log(error)
    );
  }
  openModal(template: TemplateRef<any>, _table): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });

    setTimeout(() => {
      const table: any = $('#' + _table);
      this.datatable = table.DataTable();
    }, 10);
  }
}
