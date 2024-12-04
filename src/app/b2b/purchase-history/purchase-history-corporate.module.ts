import { B2BPurchaseHistoryRoutingModule } from './purchase-history-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { PurchaseHistoryComponent } from './purchase-history-corporate.component';
import { NgSelect2Module } from 'ng-select2';
import { NgxMaskModule } from 'ngx-mask';
@NgModule({
  declarations: [PurchaseHistoryComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    B2BPurchaseHistoryRoutingModule,
    DataTablesModule,
    NgSelect2Module,
    NgxMaskModule.forRoot(),
  ],
})
export class B2BPurchaseHistoryModule {}
