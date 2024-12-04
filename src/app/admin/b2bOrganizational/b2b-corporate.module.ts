import { B2BCorporateRoutingModule } from './b2b-corporate-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { AdminB2BCorporateComponent } from './b2b-corporate.component';
import { NgSelect2Module } from 'ng-select2';
import { NgxMaskModule } from 'ngx-mask';
@NgModule({
  declarations: [AdminB2BCorporateComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    B2BCorporateRoutingModule,
    DataTablesModule,
    NgSelect2Module,
    NgxMaskModule.forRoot(),
  ],
})
export class B2BCorporateModule {}
