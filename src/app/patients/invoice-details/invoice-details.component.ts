import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { ApiUrl } from 'src/app/core/apiUrl';
import {
  DomSanitizer,
  SafeHtml,
  SafeStyle,
  SafeScript,
  SafeUrl,
  SafeResourceUrl,
} from '@angular/platform-browser';
@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.css'],
})
export class InvoiceDetailsComponent implements OnInit {
  appointmentId;
  pdf: any;
  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    protected _sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('appointment_id');
    if (this.appointmentId) {
      this.getInvoice();
    }
  }

  getInvoice(): void {
    this.http
      .postData(ApiUrl.payuInvoice, { appointtment_id: this.appointmentId })
      .subscribe(
        (resp: any) => {
          if (!!resp && resp.data) {
            const result = resp.data;
            this.showPdf(resp.data);
          }
        },
        (error) => console.log(error)
      );
  }
  showPdf(base64) {
    this.pdf = this._sanitizer.bypassSecurityTrustResourceUrl(
      'data:application/pdf;base64,' + base64
    );
  }
}
