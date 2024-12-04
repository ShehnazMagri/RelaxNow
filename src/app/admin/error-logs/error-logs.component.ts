import { NgForm } from '@angular/forms';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as $ from 'jquery';
import { ApiUrl } from '../../core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MessageService } from 'src/app/core/services/message/message.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
const now = new Date();
@Component({
  selector: 'app-doctors',
  templateUrl: './error-logs.component.html',
  styleUrls: ['./error-logs.component.css'],
})
export class ErrorLogsComponent implements OnInit {
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
  list: any = [];
  errorMessage: string;
  public docters = [];
  modalRef: BsModalRef;
  isSubmitted = false;

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.getLogs();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  getLogs() {
    var fromDate = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
    var toDate = `${this.toDate.year}-${this.toDate.month}-${this.toDate.day}`;
    const params = {
      query: `call RN_GET_LOGS('${fromDate}','${toDate}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.list = result;
          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Open Reset Password Modal ***/
  openModal(template: TemplateRef<any>, user): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-md modal-dialog-centered',
    });
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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
