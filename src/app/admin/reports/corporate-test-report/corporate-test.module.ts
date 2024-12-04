import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { NgSelect2Module } from 'ng-select2';
import { NgxMaskModule } from 'ngx-mask';
import { CorporateTestRoutingModule } from './corporate-test-routing.module';
import { AdminCorporateTestComponent } from './corporate-test.component';
import { ChartsModule } from 'ng2-charts';
@NgModule({
  declarations: [AdminCorporateTestComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    CorporateTestRoutingModule,
    DataTablesModule,
    NgSelect2Module,
    NgxMaskModule.forRoot(),
    ChartsModule,
  ],
})
export class CorporateTestModule {}
