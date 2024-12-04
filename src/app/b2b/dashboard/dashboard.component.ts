import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  TodayDate = new Date();
  userSubscription: Subscription;
  modalRef: BsModalRef;
  userId = 0;
  username = '';
  pdf;
  public testData = [];
  public hideQuestionsScreen = false;
  public selectedTestId = 0;
  public orgMainCartId = 0;
  public corporateCode = '';
  constructor(
    private message: MessageService,
    private modalService: BsModalService,
    private http: HttpService,
    private user: UserService,
    private router: Router,
    protected _sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.result[0].USERID;
          this.username =
            userData.result[0].FIRSTNAME + ' ' + userData.result[0].LASTNAME;
          this.getOrgCart();
          this.corporateCode = userData.result[0].CORPORATECODE;
          this.getTestList();
        }
      }
    );
  }

  getTestList(): void {
    var params = {
      B2BCode: this.corporateCode,
    };
    this.http.postData('/api/paymentconfiguration/get', params).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          this.testData = resp.data;
        }
      },
      (error) => console.log(error)
    );
  }

  getOrgCart(): void {
    const params = {
      query: `Call RN_GET_ORG_CART(${this.userId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (resp.data[0].result.length == 0) {
            this.addOrgCart();
          } else {
            this.orgMainCartId = resp.data[0].result[0].ID;
            this.getOrgCartCount();
          }
        }
      },
      (error) => console.log(error)
    );
  }
  addOrgCart(): void {
    debugger;
    const params = {
      query: `Call RN_ORG_CART_ADD(${this.userId},1,0,0,${this.userId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.orgMainCartId = resp.data[0].result[0].INSERTED_CART_ID;
          this.getOrgCartCount();
        }
      },
      (error) => console.log(error)
    );
  }

  getOrgCartCount(): void {
    debugger;
    const params = {
      query: `Call RN_GET_CART_PRODUCT_COUNT(${this.orgMainCartId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          localStorage.setItem(
            'cartProduct',
            resp.data[0].result[0].CARTPRODUCTCOUNT
          );
          this.router.navigateByUrl('/b2b/dashboard');
        }
      },
      (error) => console.log(error)
    );
  }

  addToCart(item) {
    debugger;
    const params = {
      query: `Call RN_ORG_CART_DETAIL_UPSERT(${this.orgMainCartId},${item.TESTID},${item.PAYMENT},1,${this.userId},1)`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (resp.data[0].result.length > 0) {
            localStorage.setItem(
              'cartProduct',
              resp.data[0].result[0].CARTPRODUCTCOUNT
            );
            this.router.navigateByUrl('/b2b/dashboard');
            this.message.showSuccess('Product added to cart Successfully');
          }
        }
      },
      (error) => console.log(error)
    );
  }
  openQuestionModal(template: TemplateRef<any>, item): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm2 modal-lg modal-xl modal-dialog-centered',
    });
    this.selectedTestId = item.TESTID;
  }

  openReportModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm2 modal-lg modal-xl modal-dialog-centered',
    });
  }

  openPDFReportModal(template: TemplateRef<any>, pdf): void {
    this.pdf = this._sanitizer.bypassSecurityTrustResourceUrl(
      pdf + '#toolbar=0'
    );
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm2 modal-lg modal-xl modal-dialog-centered',
    });
  }

  public hideQuestions(val) {
    this.hideQuestionsScreen = val;
    setTimeout(() => {
      this.hideQuestionsScreen = false;
    }, 100);
  }
}
