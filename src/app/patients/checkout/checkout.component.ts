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
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  doctorId;
  doctorDetails: any = {};
  doctorProfile: any = {};
  doctorImage = false;
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  terms = false;
  appointments: any = {};
  patients: any = [];
  isLoggedIn = false;
  userData;
  payUData;
  couponsData = [];
  discountCoupon = '';
  discountAmount = 0;
  totalAmount = 0;
  childWindow;
  appointmentId;
  fileData;
  fileName;
  modalRef: BsModalRef;
  isSubmitted = false;
  filetoUpload = '';
  checkboxEvent;
  poi = 0;
  isFollowUp;
  allSlots = [];
  public documentsLists=[{
    id:'Aadhar card',
    value:'Aadhar card'

  },{
    id:'Pan card',
    value:'Pan card'

  },{
    id:'Driving Licence',
    value:'Driving Licence'

  },{
    id:'Voter ID Card',
    value:'Voter ID Card'

  },{
    id:'Passport',
    value:'Passport'

  },{
    id:'E-Aadhaar Card',
    value:'E-Aadhaar Card'

  }];
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
    this.allSlots = JSON.parse(localStorage.getItem('allSlots'));
    if (this.isLoggedIn) {
      this.userData = this.user.currentUserValue.result[0];
      this.firstName = this.userData.FIRSTNAME;
      this.lastName = this.userData.LASTNAME;
      this.email = this.userData.EMAIL;
      this.phone = this.userData.MOBILE;
      this.poi = this.userData.POIUPLOADED;
    }

    if (this.route.snapshot.queryParams.id) {
      if (localStorage.getItem('slotData')) {
        this.appointments = JSON.parse(localStorage.getItem('slotData'));
      } else {
        this.router.navigate(['/p/booking'], {
          queryParams: { id: this.doctorId },
        });
      }
      this.doctorId = this.route.snapshot.queryParams.id;
      this.getDoctorProfile();
    }
  }

  getPaymentToken(): void {
    debugger;
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

          //TODO const fees = this.isFollowUp
          //TODO   ? this.doctorDetails?.PEOPLE_PROFILE[0]?.FOLLOWUP_CONSULTATION_FEE
          //TODO : this.doctorDetails?.PEOPLE_PROFILE[0]?.FIRST_CONSULTATION_FEE;
          const fees =
            this.doctorDetails?.PEOPLE_PROFILE[0]?.FIRST_CONSULTATION_FEE;
          if (result.length > 0) {
            if (result[0].DISCOUNT_TYPE == 0) {
              this.discountAmount = result[0].DISCOUNT_AMOUNT;
              this.totalAmount =
                +(fees * this.allSlots.length) - this.discountAmount;
            } else {
              this.discountAmount = (fees * result[0].DISCOUNT_AMOUNT) / 100;
              this.totalAmount =
                +(fees * this.allSlots.length) - this.discountAmount;
            }
            this.checkPaymentToken();
          } else {
            this.message.showError('Invalid Coupon!');
            this.totalAmount = +(fees * this.allSlots.length);
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

  /*** Get User Profile ***/
  getDoctorProfile(): void {
    this.http
      .postData(ApiUrl.getPeopleInfo, { peopleId: this.doctorId })
      .subscribe(
        (resp: any) => {
          if (!!resp && resp.data) {
            const result = resp.data;
            this.doctorDetails = result;
            this.doctorImage = true;
            this.totalAmount =
              parseInt(
                this.doctorDetails?.PEOPLE_PROFILE[0]?.FIRST_CONSULTATION_FEE
              ) * this.allSlots.length;
          }
        },
        (error) => console.log(error)
      );
  }

  booking() {
    // const params2 = {
    //   query: `Call RN_APPOINTMENT_INSERT('${this.doctorDetails.ID}','${this.userData.USERID}','${moment().format('YYYY-MM-DD')}','${moment(this.appointments.time, 'LL').format('YYYY-MM-DD')}','${this.appointments.slot.from}','${moment(this.appointments.time, 'LL').format('YYYY-MM-DD')}','${moment(this.appointments.time, 'LL').format('YYYY-MM-DD')}','1','Cash','${this.doctorProfile.FIRST_CONSULTATION_FEE}','${moment().format('YYYY-MM-DD')}','1','1','${moment().format('YYYY-MM-DD')}','1','1','${localStorage.getItem('twilioToken')}','${this.appointments.slot.to} )`,
    //   params: ''
    // };
    const params2 = {
      vPEOPLE_ID: `${this.doctorDetails.ID}`,
      vCUSTOMER_ID: `${this.userData.USERID}`,
      vBOOKING_DATE: moment().format('YYYY-MM-DD HH:MM'),
      vAPPOINTMENT_DATE: moment(this.appointments.time, 'LL').format(
        'YYYY-MM-DD'
      ),
      vAPPOINTMENT_TIME: this.appointments.slot.from, //moment(this.appointments.slot.from, 'hh:mm A').format('HH:mm'),
      vFOLLOWUP_DATE: moment(this.appointments.time, 'LL').format('YYYY-MM-DD'),
      vFOLLOWUP_TIME: `${this.appointments.slot.from}`,
      vSTATUS: '1',
      vPAYMENT_TYPE: '1',
      vPAYMENT_AMMOUNT: Number(this.totalAmount.toFixed(2)),
      vPAYMENT_DATE: moment().format('YYYY-MM-DD'),
      vPAYMENT_RECEIPT: '1',
      vMODIFIED_Date: moment().format('YYYY-MM-DD'),
      vACTIVE: '1',
      vREASON: '1',
      vAPPOINTMENT_ENDTIME: this.appointments.slot.to, //moment(this.appointments.slot.to, 'hh:mm A').format('HH:mm'),
      SCHEDULE_ID: `${this.appointments.slot.id}`,
    };
    this.http.postData(ApiUrl.createChatRoom, params2).subscribe((response) => {
      if (!!response) {
        this.appointmentId = response.data.APPOINTMENT_ID;
        this.isFollowUp = false; //response.data.IS_FOLLOW_UP;
        if (this.isFollowUp) {
          // this.totalAmount =
          //   parseInt(
          //     this.doctorDetails?.PEOPLE_PROFILE[0]?.FOLLOWUP_CONSULTATION_FEE
          //   ) * this.allSlots.length;
          if (this.discountCoupon) {
            this.getDiscountCoupon();
          }
        }
        this.insertAppointmentSlots();
        this.getPaymentToken();
      }
    });
  }

  insertAppointmentSlots(): void {
    const params = {
      slots: JSON.parse(localStorage.getItem('allSlots')),
      Appointment_Id: this.appointmentId,
    };
    this.http
      .postData('/people/Insert-appointment-slots', params)
      .subscribe((resp: any) => {
        if (!!resp) {
        }
      });
  }
  sendAppointmentMail(): void {
    const params = {
      Patient_Name: this.firstName + this.lastName,
      Email: this.email,
      Template_Name: 'APPOINTMENT_DETAILS',
      Dr_Name:
        this.doctorDetails.Prefix +
        ' ' +
        this.doctorDetails.FIRST_NAME +
        ' ' +
        this.doctorDetails.MIDDLE_NAME +
        ' ' +
        this.doctorDetails.LAST_NAME,
      Date_Time: this.appointments.time + ' ' + this.appointments.slot.from,
      Appointment_Id: this.appointmentId,
    };
    this.http.postData(ApiUrl.email, params).subscribe((resp: any) => {
      if (!!resp) {
      }
    });
  }
  checkPaymentToken(): void {
    if (this.terms) {
      if (this.appointmentId) {
        this.getPaymentToken();
      } else {
        this.booking();
      }
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
                this.updateCouponCount();
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
  initPayment(): void {
    if (+this.totalAmount === 0) {
      this.router.navigate(['/p/success', this.appointmentId]);
      return;
    }
    this.childWindow = window.open(
      'about:blank',
      'payment_popup',
      'width=900,height=500'
    );
    this.checkPyamentStatus();
  }

  onFileSelect(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const parts = file.name.split('.');
      // if (file.size / 1024 / 1024 < 5) {
      if (['jpg', 'jpeg', 'pdf', 'png'].includes(parts[parts.length - 1])) {
        const reader: FileReader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = (e: any) => {
          this.fileData = {
            Name: this.fileName,
            userId: this.userData.USERID,
            createdBy: this.userData.USERID,
            base64File: e.target.result,
            fileExtension: parts[parts.length - 1],
            creatorUserType: 1,
          };
        };
      } else {
        this.message.showError('Invalid File Type');
      }
    }
  }

  /*** Upload File ***/
  uploadFile(form: NgForm): void {
    this.isSubmitted = true;
    if (!form.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    if (!this.fileData) {
      this.message.showError('Please choose a valid file');
      return;
    }
    this.fileData.Name = this.fileName;
    this.http.postData(ApiUrl.uploadFilePoi, this.fileData).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.modalRef.hide();
          this.fileData = null;
          this.fileName = '';
          this.isSubmitted = false;
          this.filetoUpload = '';
          this.message.showSuccess('File uploaded successfully!');
        }
      },
      (error) => console.log(error)
    );
  }

  openModal(template: TemplateRef<any>, Event): void {
    this.checkboxEvent = Event;
    if (Event.currentTarget.checked && (this.poi == 0 || this.poi == null)) {
      this.modalRef = this.modalService.show(template, {
        class: 'modal-lg modal-dialog-centered',
        backdrop: 'static',
      });
    }
  }

  updateCouponCount() {
    const params = {
      query: `Call RN_UPDATE_USED_COUPON('${this.discountCoupon}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe((resp: any) => {});
  }
}
