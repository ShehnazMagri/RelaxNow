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
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { HtmlCharService } from 'src/app/htmchar-service.service';
const now = new Date();
@Component({
  selector: 'app-corporate',
  templateUrl: './corporate.component.html',
  styleUrls: ['./corporate.component.css'],
})
export class AdminCorporateComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  modalRef: BsModalRef;
  isSubmitted = false;
  emailPattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/); // '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$';
  corporateId = 0;
  testData = [];
  public corporateDetails = {
    id: 0,
    companyID: '',
    companyName: '',
    address1: '',
    address2: '',
    country: '',
    state: '',
    city: '',
    cpName: '',
    cpEmail: '',
    cpPhone: '',
    testIds: [],
    test: '',
    noUsers: '',
    startDate: null,
    endDate: null,
    payment: '',
    allowPhyscatrist: false,
    allowCounsling: false,
    allowAutoEmail: false,
  };
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

  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';

  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private msg: MessageService,
    private htmlCharService: HtmlCharService
  ) {}
  ngOnDestroy(): void {
    this.dtTrigger1.unsubscribe();
    // throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.getCorporate();
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
      companyID: '',
      companyName: '',
      address1: '',
      address2: '',
      country: '',
      state: '',
      city: '',
      cpName: '',
      cpEmail: '',
      cpPhone: '',
      testIds: [],
      test: '',
      noUsers: '',
      startDate: null,
      endDate: null,
      payment: '',
      allowPhyscatrist: false,
      allowCounsling: false,
      allowAutoEmail: false,
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

  getCorporate(): void {
    const params = {
      query: 'Call RN_GetCorporateConfiguration()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          this.listData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }

  addUpdateCorporate() {
    //this.corporateDetails.test = this.corporateDetails.testIds.join(',');
    // this.corporateDetails.startDate = `${this.corporateDetails.startDate.year}-${this.corporateDetails.startDate.month}-${this.corporateDetails.startDate.day} 20:00:02`;
    // this.corporateDetails.endDate = `${this.corporateDetails.endDate.year}-${this.corporateDetails.endDate.month}-${this.corporateDetails.endDate.day} 20:00:02`;
    this.http.postData('/admin/corporate/add', this.corporateDetails).subscribe(
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
            companyID: '',
            companyName: '',
            address1: '',
            address2: '',
            country: '',
            state: '',
            city: '',
            cpName: '',
            cpEmail: '',
            cpPhone: '',
            testIds: [],
            test: '',
            noUsers: '',
            startDate: null,
            endDate: null,
            payment: '',
            allowPhyscatrist: false,
            allowCounsling: false,
            allowAutoEmail: false,
          };
          this.getCorporate();
          this.modalRef.hide();
        }
      },
      (error) => console.log(error)
    );
  }

  openModalEdit(template: TemplateRef<any>, item): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });

    this.corporateDetails = item;

    this.isSubmitted = false;
  }

  decline() {
    this.modalRef.hide();
  }

  deleteData() {
    const params = {
      query: `Call RN_DeleteCorporate(${this.corporateId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getCorporate();
          this.modalRef.hide();
          this.msg.showSuccess('Organizational deleted successfully!');
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

  restrictSingleQuote(e) {
    var k;
    document.all ? (k = e.keyCode) : (k = e.which);
    if (k == 39) return false;
  }
}
