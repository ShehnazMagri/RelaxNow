import { HttpService } from '../../../core/services/http/http.service';
import { Component, OnInit, TemplateRef } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net';
import { ApiUrl } from 'src/app/core/apiUrl';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MessageService } from 'src/app/core/services/message/message.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-admin-schedule-reprots',
  templateUrl: './schedule-reports.component.html',
  styleUrls: ['./schedule-reports.component.css'],
})
export class AdminScheduleReportsComponent implements OnInit {
  datatable: any;
  showPersonalInfo = true;
  categoryScore = [];
  exportExcel = false;
  public reports = [];
  questions = [];
  selectedItem = null;
  modalRef: BsModalRef;
  constructor(
    private http: HttpService,
    private modalService: BsModalService,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.getReports();
  }

  getReports(): void {
    this.http.getData(`/admin/reports/get/schedule-test`, null).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result = resp.data ? resp.data : [];
          this.reports = result;
          setTimeout(() => {
            const table: any = $('table');
            this.datatable = table.DataTable();
          }, 10);
        }
      },
      (error) => console.log(error)
    );
  }

  sendReportInEmail(item): void {
    const params = {
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
    const element = document.getElementById('testReport');
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
}
