import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute, Event } from '@angular/router';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { LoaderService } from 'src/app/core/services/loader/loader.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';
declare var window: any;

@Component({
  selector: 'app-checkout-corporate',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CorporatePaytmCheckoutComponent implements OnInit {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  terms = false;
  assesments: any = {};
  isLoggedIn = false;
  userData;
  paytmData;
  couponsData = [];
  discountCoupon = '';
  discountAmount = 0;
  totalAmount = 0;
  childWindow;
  assesmentID;
  modalRef: BsModalRef;
  isSubmitted = false;
  checkboxEvent;
  payment = 0;
  currentUserRole = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private user: UserService,
    private message: MessageService,
    private loader: LoaderService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.user.getUserToken;

    if (this.isLoggedIn) {
      this.userData = this.user.currentUserValue.result[0];
      this.firstName = this.userData.FIRSTNAME;
      this.lastName = this.userData.FIRSTNAME;
      this.email = this.userData.EMAIL;
      this.phone = this.userData.MOBILE;
      this.currentUserRole = this.userData.ROLE;
    }

    if (localStorage.getItem('b2bCheckOut')) {
      this.assesments = JSON.parse(localStorage.getItem('b2bCheckOut'));
      const fees = this.assesments.amount;
      this.assesmentID = this.assesments.cartId;
      this.payment = fees;
      this.totalAmount = +fees;
      this.totalAmount = Number(this.totalAmount.toFixed(2));
    } else {
      if (this.currentUserRole == 'B2BADMIN') {
        this.router.navigate(['/b2b/dashoboard']);
      } else {
        this.router.navigate(['/p/dashoboard']);
      }
    }
  }

  getPaymentToken(): void {
    const param = {
      amount: Number(this.totalAmount.toFixed(2)),
      productinfo: 'Test',
      firstname: this.firstName,
      email: this.email,
      created_by: 1,
      assesmentid: 0,
      discount: this.discountAmount,
      userid: this.userData.USERID,
      cartId: this.assesmentID,
      phone: this.phone,
    };

    this.http.postData('/paytmCorporate/generate-tx-id', param).subscribe(
      (resp: any) => {
        if (!!resp && resp.data) {
          const result = resp.data;
          this.paytmData = result;
          this.paytmData.CALLBACK_URL =
            'http://localhost:8008/paytmCorporate/payment/success';
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Get Couponss Listing ***/
  getDiscountCoupon(): void {
    //
    this.terms = false;
    const params = {
      query: `Call RN_GET_DISCOUNT_VALUES('${this.discountCoupon}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          //

          const fees = this.assesments.amount;
          this.payment = fees;
          if (result.length > 0) {
            if (result[0].DISCOUNT_TYPE == 0) {
              this.discountAmount = result[0].DISCOUNT_AMOUNT;
              this.totalAmount = +fees - this.discountAmount;
            } else {
              this.discountAmount = (fees * result[0].DISCOUNT_AMOUNT) / 100;
              this.totalAmount = +fees - this.discountAmount;
            }
            this.checkPaymentToken();
          } else {
            this.message.showError('Invalid Coupon!');
            this.totalAmount = +fees;
            this.discountAmount = 0;
          }
          if (Number(this.totalAmount) < 0) {
            this.totalAmount = 0;
          }
          this.totalAmount = Number(this.totalAmount.toFixed(2));
        }
      },
      (error) => console.log(error)
    );
  }

  checkPaymentToken(): void {
    if (this.terms) {
      this.getPaymentToken();
    }
  }
  checkPyamentStatus(): void {
    this.loader.show();
    this.loader.showProcess();
    const params = {
      query: `Call RN_CHECK_PAYMENT_STATUS('${this.paytmData.ORDER_ID}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        this.loader.show();
        if (!!resp) {
          if (resp.data[0].result[0].STATUS) {
            if (
              resp.data[0].result[0].STATUS !== 'success' &&
              resp.data[0].result[0].STATUS !== 'failed'
            ) {
              if (!this.childWindow.closed) {
                setTimeout(() => {
                  this.checkPyamentStatus();
                }, 2000);
              } else {
                this.message.showError('Payment Failed Please try again!');
                this.loader.hide();
                this.loader.hideProcess();
              }
            } else {
              this.childWindow.close();
              this.loader.hide();
              this.loader.hideProcess();

              if (resp.data[0].result[0].STATUS === 'success') {
                localStorage.removeItem('b2bCheckOut');
                this.message.showSuccess('Payment successful!');
                this.updateCouponCount();
                if (this.currentUserRole == 'B2BADMIN') {
                  this.router.navigate(['/b2b/my-purchases']);
                } else {
                  this.router.navigate(['/p/my-purchases']);
                }
              } else {
                this.message.showError('Payment Failed Please try again!');
              }
            }
          }
        }
      },
      (error) => console.log(error)
    );
  }
  initPayment(): void {
    this.childWindow = window.open(
      'about:blank',
      'payment_popup',
      'width=900,height=500'
    );
    this.checkPyamentStatus();
  }

  updateCouponCount() {
    const params = {
      query: `Call RN_UPDATE_USED_COUPON('${this.discountCoupon}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe((resp: any) => {});
  }
}
