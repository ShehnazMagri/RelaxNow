import { UserService } from 'src/app/core/services/user/user.service';
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
import { Subject, Subscription } from 'rxjs';
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
  noOFUsers = '0';
  oldNoOfUsers = 0;
  pendingNoOfUsers = 0;
  modalRef: BsModalRef;
  companyId = 0;
  isSubmitted = false;
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$';
  corporateId = 0;
  testData = [];
  code = null;
  cartID = '0';
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
    payment: '1',
    allowPhyscatrist: false,
    allowCounsling: false,
    amount: 0,
    corporateCode: this.code,
    CartId: this.cartID,
  };
  public email = '';
  public firstName = '';
  public lastName = '';
  listData: any;
  currentDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  // Datatable Options
  dtTrigger1: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = { order: [] };
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  public userId = 0;
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';

  userSubscription: Subscription;

  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private msg: MessageService,
    private htmlCharService: HtmlCharService,
    private route: ActivatedRoute,
    private _clipboardService: ClipboardService,
    private message: MessageService,
    private user: UserService
  ) {}
  ngOnDestroy(): void {
    this.dtTrigger1.unsubscribe();
  }

  ngOnInit(): void {
    debugger;
    this.noOFUsers = sessionStorage.getItem('usersCount');
    this.cartID = this.route.snapshot.params.cartId;
    this.corporateDetails.CartId = this.cartID;
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.code = userData.result[0].CORPORATECODE;
          this.companyId = userData.result[0].COMPANYID;
          this.userId = userData.result[0].USERID;
          this.email = userData.result[0].EMAIL;
          this.firstName = userData.result[0].FIRSTNAME;
          this.lastName = userData.result[0].LASTNAME;
          this.getCorporateAssesment('0');
          this.getTestList();
        }
      }
    );
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
      payment: '1',
      allowPhyscatrist: false,
      allowCounsling: false,
      amount: 0,
      corporateCode: this.code,
      CartId: this.cartID,
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
      cartID: this.cartID,
    };
    this.http.postData('/api/b2b/get/products', params).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          this.testData = resp.data;
          this.testData = this.testData.filter((x) => x.ID > 0);
        }
      },
      (error) => console.log(error)
    );
  }

  getCorporateAssesment(id): void {
    const params = {
      query: `Call RN_GetB2BCorporateConfigurationAssesment(${this.cartID})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          this.listData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.listData.forEach((element) => {
            this.oldNoOfUsers = this.oldNoOfUsers + parseInt(element.noUsers);
          });
          this.pendingNoOfUsers = parseInt(this.noOFUsers) - this.oldNoOfUsers;
          var item = this.listData.filter((x) => x.id == id);
          this.rerender();

          if (item.length > 0) {
            this.sendEmail(item[0]);
          }
        }
      },
      (error) => console.log(error)
    );
  }

  addUpdateCorporate() {
    if (parseInt(this.corporateDetails.noUsers) == 0) {
      this.msg.showError('No Of Users cannot be zero');
    }
    if (this.pendingNoOfUsers < parseInt(this.corporateDetails.noUsers)) {
      this.msg.showError('No Of Users should be less!');
      return;
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
            debugger;
            const result =
              resp.data && resp.data[0].result ? resp.data[0].result : [];

            if (this.corporateDetails.id > 0) {
              this.msg.showSuccess('Assessment updated successfully!');
              this.getCorporateAssesment('0');
            } else {
              this.msg.showSuccess('Assessment saved successfully!');
              var createdvID = resp.data[0].vid;
              this.getCorporateAssesment(createdvID);
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
              payment: '1',
              allowPhyscatrist: false,
              allowCounsling: false,
              amount: null,
              corporateCode: this.code,
              CartId: this.cartID,
            };

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
          this.getCorporateAssesment('0');
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
        tests = tests + v.NAME.replace(/ /g, '_') + (i > 1 ? '-' : '');
        i--;
      }
    });
    let url = code;
    url = CorporateURL + url + '&test=' + tests;

    this._clipboardService.copy(url);
    this.message.showSuccess('Url copied to clipboard');
  }

  sendEmail(assestment) {
    const testIds = assestment.test.split(',');
    let tests = '';
    let i = testIds.length;
    this.testData.forEach((v) => {
      if (i && testIds.indexOf(v.ID.toString()) > -1) {
        tests = tests + v.NAME.replace(/ /g, '_') + (i > 1 ? '-' : '');
        i--;
      }
    });
    let url = this.code;
    url = CorporateURL + url + '&test=' + tests;
    this.sendAssesmentMail(url, assestment.AssesmentCode);
    this.message
      .confirmAssesmentText(url, assestment.AssesmentCode)
      .then((data) => {
        if (data.value) {
          this._clipboardService.copy(url);
          this.message.showSuccess('Url copied to clipboard');
        } else {
        }
      });
  }

  sendAssesmentMail(url, code): void {
    const params = {
      Patient_Name: this.firstName + this.lastName,
      Email: this.email,
      Template_Name: 'CASSESMENT',
      url: url,
      code: code,
    };
    this.http.postData(ApiUrl.email, params).subscribe((resp: any) => {
      if (!!resp) {
      }
    });
  }

  restrictSingleQuote(e) {
    let k;
    document.all ? (k = e.keyCode) : (k = e.which);
    if (k === 39) {
      return false;
    }
  }
}
