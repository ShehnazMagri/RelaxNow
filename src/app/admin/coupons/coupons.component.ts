import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { CouponModel } from './coupons.model';
const now = new Date();

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.css'],
})
export class CouponsComponent implements OnInit, OnDestroy {
  couponsData: Array<CouponModel> = [];
  modalRef: BsModalRef;
  isSubmitted = false;
  selectedCoupon: CouponModel = new CouponModel();
  expDate: NgbDateStruct;

  // Datatable Options
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';

  minDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private cdRef: ChangeDetectorRef,
    private msg: MessageService
  ) {}

  ngOnInit(): void {
    this.getCouponsList(true);
  }

  /*** Get Couponss Listing ***/
  getCouponsList(initial = false): void {
    const params = {
      query: 'Call RN_DISCOUNT_GETAll_LIST()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.couponsData = result;
          if (initial) {
            this.dtTrigger.next();
          } else {
            this.rerender();
          }
        }
      },
      (error) => console.log(error)
    );
  }
  checkPercentage(): void {
    if (+this.selectedCoupon.DISCOUNT_TYPE === 1) {
      if (this.selectedCoupon.DISCOUNT_AMOUNT > 100) {
        this.selectedCoupon.DISCOUNT_AMOUNT = 100;
        this.cdRef.detectChanges();
      }
    }
  }

  /*** Re-render Datatable ***/
  rerender(): void {
    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtTrigger.next();
      });
    }
  }
  /*** Open Add/Edit Modal ***/
  openModal(
    template: TemplateRef<any>,
    coupon: CouponModel = new CouponModel()
  ): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    this.isSubmitted = false;
    this.selectedCoupon = coupon;
    const expiryDate = new Date(coupon.EXPIRY_DATE);
    this.expDate = {
      year: expiryDate.getFullYear(),
      month: expiryDate.getMonth() + 1,
      day: expiryDate.getDate(),
    };
    this.checkPercentage();
  }

  /*** Open Delete Modal ***/
  deleteModal(template: TemplateRef<any>, coupon: CouponModel): void {
    this.selectedCoupon = coupon;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
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
    if (this.selectedCoupon.ID) {
      this.update();
    } else {
      this.save();
    }
  }

  /*** Insert/Save Data ***/
  save(): void {
    const expiryDate =
      this.expDate.year +
      '-' +
      (this.expDate.month > 9 ? this.expDate.month : '0' + this.expDate.month) +
      '-' +
      (this.expDate.day > 9 ? this.expDate.day : '0' + this.expDate.day);
    // const expiryDate = new Date(this.expDate.year, this.expDate.month, this.expDate.day);

    const params = {
      query: `Call RN_DISCOUNT_INSERT('${this.selectedCoupon.CODE}','${this.selectedCoupon.DISCOUNT_TYPE}','${this.selectedCoupon.DISCOUNT_AMOUNT}','${this.selectedCoupon.DESCRIPTION}','${this.selectedCoupon.USAGE_PER_LIMIT}','${expiryDate}','${this.modifiedBy}')`,
      params: '',
    };
    this.executeRequest(params, 'save');
    this.modalRef.hide();
    this.isSubmitted = false;
  }

  /*** Update Data ***/
  update(): void {
    const expiryDate =
      this.expDate.year +
      '-' +
      (this.expDate.month > 9 ? this.expDate.month : '0' + this.expDate.month) +
      '-' +
      (this.expDate.day > 9 ? this.expDate.day : '0' + this.expDate.day);
    // const expiryDate = new Date(this.expDate.year, this.expDate.month, this.expDate.day);

    const params = {
      query: `Call RN_DISCOUNT_UPDATE('${this.selectedCoupon.ID}','${this.selectedCoupon.CODE}','${this.selectedCoupon.DISCOUNT_TYPE}','${this.selectedCoupon.DISCOUNT_AMOUNT}','${this.selectedCoupon.DESCRIPTION}','${this.selectedCoupon.USAGE_PER_LIMIT}','${expiryDate}','${this.modifiedBy}','${this.selectedCoupon.ACTIVE}')`,
      params: '',
    };

    this.executeRequest(params, 'update');
    this.modalRef.hide();
    this.isSubmitted = false;
  }

  /*** Execute Procedular query  ***/
  executeRequest(params: any, type: string = ''): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (type === 'save') {
            this.getCouponsList();
            this.msg.showSuccess('Coupon saved successfully!');
          }
          if (type === 'update') {
            this.getCouponsList();
            this.msg.showSuccess('Coupon updated successfully!');
          }
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Confirm Delete ***/
  deleteCoupon(): void {
    const params = {
      query: `Call RN_DISCOUNT_DELETE(${this.selectedCoupon.ID})`,
      params: '',
    };
    this.executeRequest(params);
    this.modalRef.hide();
  }

  confirmChange(): void {
    this.changeStatus(!this.selectedCoupon.ACTIVE, this.selectedCoupon);
    this.modalRef.hide();
  }
  /*** Cancel Delete ***/
  decline() {
    this.getCouponsList();
    this.modalRef.hide();
  }

  /*** Toogle Status ***/
  changeStatus(event: boolean, coupon: CouponModel): void {
    const params = {
      query: `Call RN_DISCOUNT_UPDATE('${coupon.ID}','${coupon.CODE}','${
        coupon.DISCOUNT_TYPE
      }','${coupon.DISCOUNT_AMOUNT}','${coupon.DESCRIPTION}','${
        coupon.USAGE_PER_LIMIT
      }','${coupon.EXPIRY_DATE}','${this.modifiedBy}',${+event})`,
      params: '',
    };
    this.executeRequest(params, 'update');
  }

  /*** UnSubscribe the events to prevent memory leakage ***/
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
