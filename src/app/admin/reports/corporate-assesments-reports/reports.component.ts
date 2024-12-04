import { HttpService } from '../../../core/services/http/http.service';
import { Component, OnInit, TemplateRef } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net';
import { ApiUrl } from 'src/app/core/apiUrl';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MessageService } from 'src/app/core/services/message/message.service';
import * as XLSX from 'xlsx';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-admin-corporate-reprots',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class AdminCorporateAssesmentReportsComponent implements OnInit {
  datatable: any;
  showPersonalInfo = true;
  categoryScore = [];
  exportExcel = false;
  public reports = [];
  questions = [];
  selectedItem = null;
  modalRef: BsModalRef;
  code = '';
  categoryResult = [];
  public resultRangeData = [];
  currentUserRole = '';
  constructor(
    private http: HttpService,
    private modalService: BsModalService,
    private message: MessageService,
    private route: ActivatedRoute,
    private user: UserService
  ) {}

  ngOnInit(): void {
    this.code = this.route.snapshot.params.code;
    this.currentUserRole = this.user.currentUserValue.result[0].ROLE;
    this.getResultDescription();
    this.getReports();
  }

  getReports(): void {
    var p = { code: this.code };
    var params = this.http
      .postData(`/admin/reports/get/corporate-reports-assesments`, p)
      .subscribe(
        (resp: any) => {
          if (!!resp) {
            const result = resp.data ? resp.data : [];
            this.reports = result;
            this.categoryResult = resp.dataCategory;
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
    var url =
      'data:application/vnd.ms-excel,' +
      encodeURIComponent($('#testReport').html());
    location.href = url;
    return false;
    // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    // /* generate workbook and add the worksheet */
    // const wb: XLSX.WorkBook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // /* save to file */
    // XLSX.writeFile(wb, 'report.xlsx');
    // this.exportExcel = false;
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

  getCategoryResult(item): any {
    var catr = this.categoryResult.filter(
      (x) =>
        x.CUSTOMER_ID == item.CUSTOMER_ID &&
        x.RESULT_ID == item.items[0].RESULT_ID &&
        x.TEST_ID == item.TESTID
    );
    return catr;
  }

  public getColor(item, _item): any {
    //  [ngClass]="{'green':item.TESTID!=3 && _item.TOTAL>=0 && _item.TOTAL<=27,
    //                                     'blue':item.TESTID!=3 && _item.TOTAL>27 && _item.TOTAL<=44,
    //                                   'yellow':item.TESTID!=3 && _item.TOTAL>44}"
    if (item.TESTID != 3 && _item.TOTAL >= 0 && _item.TOTAL <= 27) {
      return 'green';
    }
    if (item.TESTID != 3 && _item.TOTAL > 27 && _item.TOTAL <= 44) {
      return 'blue';
    }
    if (item.TESTID != 3 && _item.TOTAL > 44) {
      return 'yellow';
    }
  }

  getResultDescription(): void {
    const params = {
      query: `Call RN_EWI_TEST_RESULT_RANGE_GET()`,
      params: '',
    };

    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.resultRangeData = resp.data ? resp.data : [];
        }
      },
      (error) => console.log(error)
    );
  }

  public getOverAllResultText(item): any {
    var dataResponse = this.resultRangeData.filter(
      (x) =>
        x.MIN_VALUE <= item.TEST_SCORE &&
        x.MAX_VALUE >= item.TEST_SCORE &&
        x.TEST_ID == item.TESTID
    );
    if (dataResponse.length > 0) {
      return dataResponse[0].RESULT_TERM;
    }
  }

  public getOverAllResultColor(item): any {
    var dataResponse = this.resultRangeData.filter(
      (x) =>
        x.MIN_VALUE <= item.TEST_SCORE &&
        x.MAX_VALUE >= item.TEST_SCORE &&
        x.TEST_ID == item.TESTID
    );
    if (dataResponse.length > 0) {
      return dataResponse[0].COLOR;
    }
  }
}
