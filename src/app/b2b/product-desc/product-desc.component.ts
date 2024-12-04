import { Component, OnInit, TemplateRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { HtmlCharService } from 'src/app/htmchar-service.service';

@Component({
  selector: 'app-product-desc',
  templateUrl: './product-desc.component.html',
  styleUrls: ['./product-desc.component.css'],
})
export class ProductDescComponent implements OnInit {
  testId = 0;
  pdf;
  testDescription = '';
  public testDetails: any;
  userSubscription: Subscription;
  modalRef: BsModalRef;
  hideQuestionsScreen = false;
  public userId = 0;
  public orgMainCartId = 0;
  currentUserRole = '';
  corporateCode = 'DEFAULT';
  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private message: MessageService,
    private user: UserService,
    private htmlCharService: HtmlCharService,
    private modalService: BsModalService,
    private router: Router,
    protected _sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.testId = this.route.snapshot.params.ID;
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.result[0].USERID;
          this.currentUserRole = userData.result[0].ROLE;
          if (this.currentUserRole == 'B2BADMIN') {
            this.corporateCode = userData.result[0].CORPORATECODE;
          }

          this.getOrgCart();
        }
      }
    );
    this.getTestByID();
  }

  getTestByID(): void {
    const params = {
      query: `Call RN_GET_TEST_CONFIGURATIONS_DETAILS('${this.corporateCode}','${this.testId}')`,
      params: '',
    };

    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          this.testDetails = resp.data[0];
          this.testDescription = this.htmlCharService.decodeHtmlCharCodes(
            resp.data[0].DESCRIPTION
          );
        }
      },
      (error) => console.log(error)
    );
  }

  openQuestionModal(template: TemplateRef<any>): void {
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

  getOrgCart(): void {
    const params = {
      query: `Call RN_GET_ORG_CART(${this.userId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (resp.data[0].result.length > 0) {
            this.orgMainCartId = resp.data[0].result[0].ID;
          }
        }
      },
      (error) => console.log(error)
    );
  }

  addToCart(item) {
    debugger;
    const params = {
      query: `Call RN_ORG_CART_DETAIL_UPSERT(${this.orgMainCartId},${item.ID},${item.PAYMENT},1,${this.userId},1)`,
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
            if (this.currentUserRole == 'B2BADMIN') {
              this.router.navigateByUrl(`/b2b/product-desc/${this.testId}`);
            } else {
              this.router.navigateByUrl(`/p/product-desc/${this.testId}`);
            }

            this.message.showSuccess('Product added to cart Successfully');
          }
        }
      },
      (error) => console.log(error)
    );
  }

  openPDFReportModal(template: TemplateRef<any>, pdf): void {
    this.pdf = this._sanitizer.bypassSecurityTrustResourceUrl(
      pdf + '#toolbar=0'
    );
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm2 modal-lg modal-xl modal-dialog-centered',
    });
  }
}
