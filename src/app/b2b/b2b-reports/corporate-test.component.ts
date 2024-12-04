import { UserService } from 'src/app/core/services/user/user.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { HtmlCharService } from 'src/app/htmchar-service.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { ChartOptions } from 'chart.js';

const now = new Date();
@Component({
  selector: 'app-b2b-corporate-test',
  templateUrl: './corporate-test.component.html',
  styleUrls: ['./corporate-test.component.css'],
})
export class AdminCorporateTestComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  reportDataSet = [];
  testData = [];
  isSubmitted = false;
  corporateId = '0';
  listData: any;
  testId = 0;
  public selectedAssesment = null;
  dtTrigger1: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  public pieChartLabels = [];
  public pieChartData = [];
  public pieChartPlugins = [pluginDataLabels];
  public chartColors: Array<any> = [
    {
      backgroundColor: [],
      borderColor: [],
    },
  ];
  public pieChartType = 'pie';
  @ViewChild('contentPdf', { static: false }) contentPdf: ElementRef;
  public pieChartOptions: ChartOptions = {
    responsive: true,
    tooltips: { enabled: false },
    hover: { mode: null },
    legend: { position: 'right' },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          // const label = ctx.chart.data.labels[ctx.dataIndex] + ':' + value;
          const label = value + '%';
          return label;
        },
        color: '#fff',
      },
    },
  };
  selectedTest = '';
  selectedOrg = '';
  corprotateAssesment = [];
  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private msg: MessageService,
    private htmlCharService: HtmlCharService,
    private user: UserService
  ) {}
  ngOnDestroy(): void {
    this.dtTrigger1.unsubscribe();
  }

  ngOnInit(): void {
    this.corporateId = this.user.currentUserValue.result[0].CORPORATECODE;
    //this.getTestList();
    this.getCorporateAssesment();
  }

  rerender(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtTrigger1.next();
      });
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger1.next();
  }

  getTestList(event): void {
    var assesment = this.corprotateAssesment.find(
      (x) => x.AssesmentCode == event
    );
    debugger;
    const params = {
      query: `Call RN_GET_CORPORATE_ASSESMENT_TEST(${assesment.id})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          this.testData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
        }
      },
      (error) => console.log(error)
    );
  }

  getReport(): void {
    if (
      this.selectedAssesment == null ||
      this.selectedAssesment == '' ||
      this.testId == 0
    ) {
      this.msg.showError('All fields are required.');
      return;
    }
    const params = {
      query: `Call RN_GET_CORPORATE_TEST_REPORT_BY_ASSESMENT('${this.selectedAssesment}','${this.testId}')`,
      params: '',
    };

    this.selectedOrg = '';
    debugger;
    const Org = this.corprotateAssesment.find(
      (v) => v.AssesmentCode === this.selectedAssesment
    );
    this.selectedOrg = Org.AssesmentName;
    this.http.postData('/api/executeSP', params).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          const dataSet = [];
          resp.data.resultset1.forEach((element) => {
            dataSet.push({
              result_term: element.RESULT_TERM,
              count: 0,
              color: element.COLOR,
            });
          });
          resp.data.resultset0.forEach((element1) => {
            resp.data.resultset1.forEach((element) => {
              if (
                element1.TEST_SCORE >= element.MIN_VALUE &&
                element1.TEST_SCORE <= element.MAX_VALUE
              ) {
                if (
                  dataSet.filter((x) => x.result_term === element.RESULT_TERM)
                    .length > 0
                ) {
                  const dataCount = dataSet.find(
                    (x) => x.result_term === element.RESULT_TERM
                  );
                  if (dataCount != null) {
                    dataCount.count = dataCount.count + 1;
                  }
                } else {
                  dataSet.push({
                    result_term: element.RESULT_TERM,
                    count: 1,
                    color: element.COLOR,
                  });
                }
              }
            });
          });
          this.pieChartLabels = [];
          this.pieChartData = [];
          this.chartColors = [
            {
              backgroundColor: [],
              borderColor: [],
            },
          ];
          let sum = 0;
          dataSet.map((data) => {
            sum += data.count;
          });
          dataSet.forEach((element) => {
            this.pieChartLabels.push(element.result_term);
            const percentage = ((element.count * 100) / sum).toFixed(2);
            this.pieChartData.push(percentage);
            this.chartColors[0].backgroundColor.push(element.color);
            this.chartColors[0].borderColor.push(element.color);
          });
          this.reportDataSet = dataSet;
          console.log(dataSet);
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Print/Download Pdf ***/
  printPdf(): void {
    setTimeout(() => {
      const content = this.contentPdf.nativeElement;
      html2canvas(content, { scale: 2 }).then(
        (canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'pt', 'a4');
          // const width = pdf.internal.pageSize.getWidth();
          // const height = pdf.internal.pageSize.getHeight() - 40;
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(imgData, 'JPEG', 0, 100, pdfWidth, pdfHeight);
          pdf.save(`OrganisationalGroupReport.pdf`);
        },
        (error) => {
          console.log('error:- ', error);
        }
      );
    }, 100);
  }
  onTestSelect(type): void {
    this.isSubmitted = false;
    if (type === 'test') {
      this.selectedTest = '';
      const test = this.testData.find((v) => +v.ID === +this.testId);
      this.selectedTest = test.Name;
    } else {
      this.selectedOrg = '';
      debugger;
      const Org = this.corprotateAssesment.find(
        (v) => v.AssesmentCode === this.selectedAssesment
      );
      this.selectedOrg = Org.AssesmentName;
    }
  }

  getCorporateAssesment(): void {
    const params = {
      query: `Call RN_GetCorporateConfigurationAssesmentByCode('${this.corporateId}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          this.corprotateAssesment =
            resp.data && resp.data[0].result ? resp.data[0].result : [];

          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }
}
