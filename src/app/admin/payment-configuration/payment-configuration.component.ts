import { ActivatedRoute } from '@angular/router';
import { element } from 'protractor';
import { MessageService } from 'src/app/core/services/message/message.service';
import { HttpService } from '../../core/services/http/http.service';
import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import 'datatables.net';
import { ApiUrl } from 'src/app/core/apiUrl';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { LoaderService } from 'src/app/core/services/loader/loader.service';
import * as moment from 'moment';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-payment-configuration',
  templateUrl: './payment-configuration.component.html',
  styleUrls: ['./payment-configuration.component.css'],
})
export class PaymentConfigurationComponent implements OnInit {
  public appointments = [];
  daterange: any = {};
  currentDate = new Date();
  B2BCode = 'DEFAULT';
  configurations = [];
  constructor(
    private http: HttpService,
    private loader: LoaderService,
    private msg: MessageService,
    private route: ActivatedRoute,
    private _clipboardService: ClipboardService
  ) {}

  ngOnInit(): void {
    debugger;
    if (this.route.snapshot.params.code) {
      this.B2BCode = this.route.snapshot.params.code;
    }
    this.getPaymentConfiguration();
  }

  getPaymentConfiguration(): void {
    var params = {
      B2BCode: this.B2BCode,
    };
    this.http.postData('/api/paymentconfiguration/get', params).subscribe(
      (resp: any) => {
        debugger;
        this.configurations = resp.data;
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
  addPayment(item) {
    var params = {
      PRODUCTID: item.TESTID,
      PAYMENT: item.PAYMENT,
      B2BCode: this.B2BCode,
    };
    this.http.postData('/api/paymentconfiguration/add', params).subscribe(
      (resp: any) => {
        if (resp.status == 200) {
          this.msg.showSuccess('Payment Configuration added successfully');
        }
      },
      (error) => console.log(error)
    );
  }
  copy(){
    var params= {
      b2bToken:localStorage.getItem("b2bToken"),
      cpName:localStorage.getItem("cpName"),
      cpPhone:localStorage.getItem("cpPhone"),
      cpEmail:localStorage.getItem("cpEmail")
    }
    this.http
    .postData('/admin/corporate/add/b2bemail', params)
    .subscribe(
      (resp: any) => {
        if (!!resp) {
          this._clipboardService.copy(localStorage.getItem("b2bURL"));
          this.msg.showSuccess('Url copied to clipboard');
        }
      },
      (error) => console.log(error)
    );
  }
  copyURL()
  {
    this._clipboardService.copy(localStorage.getItem("b2bURL"));
    this.msg.showSuccess('Url copied to clipboard');
  }
}
