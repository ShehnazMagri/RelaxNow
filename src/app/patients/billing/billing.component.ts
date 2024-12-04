import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from '../../core/services/http/http.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net';
import { ApiUrl } from 'src/app/core/apiUrl';
import { Subject, Subscription } from 'rxjs';
import { UserService } from 'src/app/core/services/user/user.service';
@Component({
  selector: 'app-patient-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
})
export class PatientBillingComponent implements OnInit, OnDestroy {
  dtTrigger: Subject<any> = new Subject<any>();
  public billings = [];
  public userId = 0;
  userSubscription: Subscription;
  modalRef: BsModalRef;
  dtOptions: DataTables.Settings = { order: [] };
  pdf: any;
  constructor(
    private http: HttpService,
    private user: UserService,
    protected _sanitizer: DomSanitizer,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.result[0].USERID;
        }
      }
    );
    this.getPatientBilling();
  }

  getPatientBilling(): void {
    const params = {
      query: `call GET_RECEIPT_INFO(${this.userId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.billings = result;
          setTimeout(() => {
            this.dtTrigger.next();
          });
        }
      },
      (error) => console.log(error)
    );
  }

  getInvoice(appointmentId, template): void {
    this.http
      .postData(ApiUrl.payuInvoice, { appointtment_id: appointmentId })
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

  /*** UnSubscribe the events to prevent memory leakage ***/
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
