import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CouponsRoutingModule } from './coupons-routing.module';
import { CouponsComponent } from './coupons.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [CouponsComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    CouponsRoutingModule,
    DataTablesModule,
  ],
})
export class CouponsModule {}
