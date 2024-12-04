import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { HtmlCharService } from 'src/app/htmchar-service.service';
const now = new Date();
@Component({
  selector: 'app-purchase-history',
  templateUrl: './purchase-history-corporate.component.html',
  styleUrls: ['./purchase-history-corporate.component.css'],
})
export class PurchaseHistoryComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  modalRef: BsModalRef;
  pdf: any;
  corporateId = 0;
  testData = [];
  listData: any;
  dtTrigger1: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = { order: [] };
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  currentUserRole = '';
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';
  userSubscription: Subscription;
  userId = 0;
  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private msg: MessageService,
    private htmlCharService: HtmlCharService,
    private user: UserService,
    protected _sanitizer: DomSanitizer,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    this.dtTrigger1.unsubscribe();
    // throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.result[0].USERID;
          this.currentUserRole = userData.result[0].ROLE;
          this.getPurchaseHistory();
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

  getPurchaseHistory(): void {
    debugger;
    const params = {
      query: `Call RN_GET_B2B_CUSTOMER_PURCHASE_HISTORY(${this.userId})`,
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

  restrictSingleQuote(e) {
    var k;
    document.all ? (k = e.keyCode) : (k = e.which);
    if (k == 39) return false;
  }

  getInvoice(cartID, template): void {
    this.http
      .postData('/payucorporate/payment/invoice', {
        cartID: cartID,
      })
      .subscribe(
        (resp: any) => {
          if (!!resp && resp.data) {
            const result = resp.data;
            this.showPdf(result, template);
            console.log(resp);
          }
        },
        (error) => console.log(error)
      );
  }
  showPdf(base64, template) {
    //
    this.pdf = this._sanitizer.bypassSecurityTrustResourceUrl(
      'data:application/pdf;base64,' + base64
    );
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
  }
  redirectToAssesment(item) {
    sessionStorage.setItem('usersCount', item.CART_USERS);
    this.router.navigateByUrl('/b2b/assesment/' + item.ID);
  }
}
