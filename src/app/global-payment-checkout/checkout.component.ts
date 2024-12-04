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
const CryptoJS = require('crypto-js');
@Component({
  selector: 'app-checkout-corporate',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CorporateCheckoutComponent implements OnInit {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  terms = false;
  assesments: any = {};
  isLoggedIn = false;
  userId;
  payUData;
  childWindow;
  appointmentId;
  modalRef: BsModalRef;
  isSubmitted = false;
  checkboxEvent;
  payment = 0;
  public totalAmount = 0;
  public discountAmount = 0;
  public appointmentDetail: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private user: UserService,
    private message: MessageService,
    private loader: LoaderService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.user.getUserToken;

    // if (this.isLoggedIn) {
    //   this.firstName = this.userData.FIRSTNAME;
    //   this.lastName = this.userData.LASTNAME;
    //   this.email = this.userData.EMAIL;
    //   this.phone = this.userData.MOBILE;
    // }

    let url = this.route.snapshot.params.id;

    if (url) {
      url = url
        .replaceAll('xMl3Jk', '+')
        .replaceAll('Por21Ld', '/')
        .replaceAll('Ml32', '=');
      const bytes = CryptoJS.AES.decrypt(url, '@Test');
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      this.appointmentId = originalText;
      this.getCheckoutAppointmentPayments();
    }
  }

  getPaymentToken(): void {
    const param = {
      amount: Number(this.totalAmount.toFixed(2)),
      productinfo: 'Test',
      firstname: this.firstName,
      email: this.email,
      created_by: 1,
      appointment_id: this.appointmentId,
      discount: this.discountAmount,
    };

    this.http.postData(ApiUrl.payuKeys, param).subscribe(
      (resp: any) => {
        if (!!resp && resp.data) {
          const result = resp.data;
          this.payUData = result;
          this.payUData.surl =
            'https://noworrynotension.in/nodetest/payu/payment/success';
          this.payUData.furl =
            'https://noworrynotension.in/nodetest/payu/payment/fail';
          //  this.payUData.service_provider = 'payu_paisa';
        }
      },
      (error) => console.log(error)
    );
  }

  getCheckoutAppointmentPayments(): void {
    const param = {
      appointmentid: this.appointmentId,
    };

    this.http.postData('/api/global-checkout', param).subscribe(
      (resp: any) => {
        if (!!resp && resp.data) {
          debugger;
          const result = resp.data;
          debugger;
          this.appointmentDetail = resp.data;
          this.firstName = this.appointmentDetail.CFIRSTNAME;
          this.lastName = this.appointmentDetail.CLASTNAME;
          this.email = this.appointmentDetail.CEMAIL;
          this.phone = this.appointmentDetail.CMOBILE;
          this.totalAmount = this.appointmentDetail.PAYMENT_AMMOUNT;
          this.totalAmount = Number(this.totalAmount.toFixed(2));
          //  this.payUData.service_provider = 'payu_paisa';
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
      query: `Call RN_GET_PAYMENT_STATUS('${this.payUData.txnid}')`,
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
                this.sendAppointmentMail();
                localStorage.removeItem('slotData');
                this.message.showSuccess('Payment successful!');
                this.router.navigate(['/p/success', this.appointmentId]);
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

  sendAppointmentMail(): void {
    const params = {
      Patient_Name: this.firstName + this.lastName,
      Email: this.email,
      Template_Name: 'APPOINTMENT_DETAILS',
      Dr_Name:
        this.appointmentDetail.Prefix +
        ' ' +
        this.appointmentDetail.FIRST_NAME +
        ' ' +
        this.appointmentDetail.MIDDLE_NAME +
        ' ' +
        this.appointmentDetail.LAST_NAME,
      Date_Time:
        this.appointmentDetail.APPOINTMENT_DATE +
        ' ' +
        this.appointmentDetail.APPOINTMENT_TIME,
      Appointment_Id: this.appointmentId,
    };
    this.http.postData(ApiUrl.email, params).subscribe((resp: any) => {
      if (!!resp) {
      }
    });
  }

  initPayment(): void {
    this.childWindow = window.open(
      'about:blank',
      'payment_popup',
      'width=900,height=500'
    );
    this.checkPyamentStatus();
  }
}
