import { CorporateRoutingModule } from './corporate-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { AdminCorporateComponent } from './corporate.component';
import { NgSelect2Module } from 'ng-select2';
import { NgxMaskModule } from 'ngx-mask';
@NgModule({
  declarations: [AdminCorporateComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    CorporateRoutingModule,
    DataTablesModule,
    NgSelect2Module,
    NgxMaskModule.forRoot(),
  ],
})
export class CorporateModule {}
