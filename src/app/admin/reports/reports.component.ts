import { HttpService } from '../../core/services/http/http.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net';
import { ApiUrl } from 'src/app/core/apiUrl';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MessageService } from 'src/app/core/services/message/message.service';
import * as XLSX from 'xlsx';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { HtmlCharService } from 'src/app/htmchar-service.service';
@Component({
  selector: 'app-admin-reprots',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class AdminReportsComponent implements OnInit {
  datatable: any;
  showPersonalInfo = true;
  categoryScore = [];
  exportExcel = false;
  public reports = [];
  questions = [];
  selectedItem = null;
  modalRef: BsModalRef;
  searchText="";

  daterange: any = {
    start:moment().days(-3),
    end:moment()
  };
  currentDate = new Date();
  fromDate: NgbDateStruct;
  options: any = {
    locale: { format: 'YYYY-MM-DD' },
    alwaysShowCalendars: false,
    startDate:moment().days(-3)
   // minDate: this.currentDate,
  };

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  todayCurrentDate = new Date();
  today = moment();

  constructor(
    private http: HttpService,
    private modalService: BsModalService,
    private message: MessageService,
    private htmlCharService: HtmlCharService
  ) {}

  ngOnInit(): void {
    debugger;
    this.daterange = {
      start:moment().days(-3),
      end:moment()
    };
    this.getReports();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
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
    this.getReports();
  }
  getReports(): void {
    debugger;
    var params={
      fromDate:moment(
        this.daterange.start
      ).format('YYYY-MM-DD'),
      toDate:moment(this.daterange.end).format(
        'YYYY-MM-DD'
      )
    }
    this.http.postData(`/admin/reports/get`, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result = resp.data ? resp.data : [];
          this.reports = result;
          console.log(result);
          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }

  getReportsByParams(): void {
    debugger;
    var params={
     name:this.searchText
    }
    this.http.postData(`/admin/reports/get-by-params`, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result = resp.data ? resp.data : [];
          this.reports = result;
          console.log(result);
          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }

  sendReportInEmail(item): void {
    var params = {
      email: item.EMAIL,
      Test_ID: item.TESTID,
      testName: item.TESTNAME,
      Patient_Name: item.FIRST_NAME + ' ' + item.LAST_NAME,
      reportName: item.RESULT_FILE,
      reportPath: item.RESULT_FILE_BASEURL,
    };
    this.http.postData(`/report/send-report`, params).subscribe((resp: any) => {
      if (!!resp) {
        this.message.showSuccess('Report sent successfully.');
      }
    });
  }

  openModal(template: TemplateRef<any>, questions): void {
    this.questions = questions.items;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
  }

  downloadExcel() {
    this.exportExcel = true;
    let element = document.getElementById('testReport');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'report.xlsx');
    this.exportExcel = false;
  }

  getScores(item, template): void {
    this.selectedItem = item;
    const params = {
      query: `call RN_CUSTOMER_CATEGORY_SCORE_GET(${item.TESTID},${item.CUSTOMER_ID},${item.items[0].RESULT_ID})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];

          this.categoryScore = result;
          this.modalRef = this.modalService.show(template, {
            class: 'modal-lg modal-dialog-centered',
          });
        }
      },
      (error) => console.log(error)
    );
  }

  getSum(): number {
    let sum = 0;
    for (let i = 0; i < this.categoryScore.length; i++) {
      sum += this.categoryScore[i].TOTAL;
    }
    return sum;
  }

  /*** Re-render Datatable ***/
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

  /*** UnSubscribe the events to prevent memory leakage ***/
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
