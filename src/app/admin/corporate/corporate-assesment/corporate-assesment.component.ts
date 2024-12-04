import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClipboardService } from 'ngx-clipboard';
import { Subject } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { HtmlCharService } from 'src/app/htmchar-service.service';
import { CorporateURL } from 'src/app/core/apiUrl';
const now = new Date();
const CryptoJS = require('crypto-js');
@Component({
  selector: 'app-corporate-assesment',
  templateUrl: './corporate-assesment.component.html',
  styleUrls: ['./corporate-assesment.component.css'],
})
export class AdminCorporateAssesmentComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  modalRef: BsModalRef;
  companyId = 0;
  isSubmitted = false;
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$';
  corporateId = 0;
  testData = [];
  code = null;
  public corporateDetails = {
    id: 0,
    companyID: this.companyId,
    assesmentCode: '',
    companyName: '',
    testIds: [],
    test: '',
    noUsers: '',
    startDate: null,
    endDate: null,
    payment: '',
    allowPhyscatrist: false,
    allowCounsling: false,
    amount: null,
    corporateCode: this.code,
  };
  listData: any;
  currentDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  // Datatable Options
  dtTrigger1: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';

  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private msg: MessageService,
    private htmlCharService: HtmlCharService,
    private route: ActivatedRoute,
    private _clipboardService: ClipboardService,
    private message: MessageService
  ) {}
  ngOnDestroy(): void {
    this.dtTrigger1.unsubscribe();
  }

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params.corporateId;
    this.code = this.route.snapshot.params.code;
    this.getCorporateAssesment();
    this.getTestList();
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

  /*** Open Add/Edit Modal ***/
  openModal(template: TemplateRef<any>): void {
    this.corporateDetails = {
      id: 0,
      companyID: this.companyId,
      assesmentCode: '',
      companyName: '',
      testIds: [],
      test: '',
      noUsers: '',
      startDate: null,
      endDate: null,
      payment: '',
      allowPhyscatrist: false,
      allowCounsling: false,
      amount: null,
      corporateCode: this.code,
    };
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    this.isSubmitted = false;
  }
  /*** Submit Form ***/
  submitForm(form: NgForm): void {
    this.isSubmitted = true;
    if (!form.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    this.addUpdateCorporate();
  }

  getTestList(): void {
    const params = {
      query: 'Call RN_SP_GET_EWI_TEST()',
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

  getCorporateAssesment(): void {
    const params = {
      query: `Call RN_GetCorporateConfigurationAssesment(${this.companyId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          debugger;

          this.listData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];

          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }

  addUpdateCorporate() {
    if (parseInt(this.corporateDetails.noUsers) == 0) {
      this.msg.showError('No Of Users cannot be zero');
    }
    this.modalRef.hide();
    this.corporateDetails.test = this.corporateDetails.testIds.join(',');
    this.corporateDetails.startDate = `${this.corporateDetails.startDate.year}-${this.corporateDetails.startDate.month}-${this.corporateDetails.startDate.day} 20:00:02`;
    this.corporateDetails.endDate = `${this.corporateDetails.endDate.year}-${this.corporateDetails.endDate.month}-${this.corporateDetails.endDate.day} 20:00:02`;
    this.http
      .postData('/admin/corporate/add/assesments', this.corporateDetails)
      .subscribe(
        (resp: any) => {
          if (!!resp) {
            const result =
              resp.data && resp.data[0].result ? resp.data[0].result : [];
            if (this.corporateDetails.id > 0) {
              this.msg.showSuccess('Organizational updated successfully!');
            } else {
              this.msg.showSuccess('Organizational saved successfully!');
            }
            this.corporateDetails = {
              id: 0,
              companyID: this.companyId,
              assesmentCode: '',
              companyName: '',
              testIds: [],
              test: '',
              noUsers: '',
              startDate: null,
              endDate: null,
              payment: '',
              allowPhyscatrist: false,
              allowCounsling: false,
              amount: null,
              corporateCode: this.code,
            };
            this.getCorporateAssesment();
            this.modalRef.hide();
          }
        },
        (error) => console.log(error)
      );
  }

  keydown(e) {
    if (
      !(
        (e.keyCode > 95 && e.keyCode < 106) ||
        (e.keyCode > 47 && e.keyCode < 58) ||
        e.keyCode === 8
      )
    ) {
      return false;
    }
  }

  openModalEdit(template: TemplateRef<any>, item): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    const _startDate = item.startDate.split('-');
    const startDate = {
      year: +_startDate[0],
      month: +_startDate[1],
      day: +_startDate[2].split('T')[0],
    };

    const _endDate = item.endDate.split('-');
    const endDate = {
      year: +_endDate[0],
      month: +_endDate[1],
      day: +_endDate[2].split('T')[0],
    };

    this.corporateDetails = item;
    this.corporateDetails.companyName = item.AssesmentName;
    this.corporateDetails.assesmentCode = item.AssesmentCode;
    this.corporateDetails.endDate = endDate;
    this.corporateDetails.startDate = startDate;
    this.corporateDetails.testIds = item.test.split(',');
    this.isSubmitted = false;
  }

  decline() {
    this.modalRef.hide();
  }

  deleteData() {
    const params = {
      query: `Call RN_DeleteCorporateAssesment(${this.corporateId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getCorporateAssesment();
          this.modalRef.hide();
          this.msg.showSuccess('Corporate deleted successfully!');
        }
      },
      (error) => console.log(error)
    );
  }

  openDeleteModal(template: TemplateRef<any>, id): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
    this.corporateId = id;
  }

  copy(code, assestment) {
    const testIds = assestment.test.split(',');
    let tests = '';
    let i = testIds.length;
    this.testData.forEach((v) => {
      if (i && testIds.indexOf(v.ID.toString()) > -1) {
        tests = tests + v.Name.replace(/ /g, '_') + (i > 1 ? '-' : '');
        i--;
      }
    });
    let url = code; //CryptoJS.AES.encrypt(code, '@Test').toString();
    // url = url.replaceAll('+', 'xMl3Jk');
    // url = url.replaceAll('/', 'Por21Ld');
    // url = url.replaceAll('=', 'Ml32');
    url = CorporateURL + url + '&test=' + tests;
    this._clipboardService.copy(url);
    this.message.showSuccess('Url copied to clipboard');
  }

  restrictSingleQuote(e) {
    let k;
    document.all ? (k = e.keyCode) : (k = e.which);
    if (k === 39) {
      return false;
    }
  }
}
