import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CorporateReportsRoutingModule } from './reports-routing.module';
import { AdminCorporateReportsComponent } from './reports.component';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [AdminCorporateReportsComponent],
  imports: [
    CommonModule,
    CorporateReportsRoutingModule,
    DataTablesModule,
    FormsModule,
  ],
})
export class CorporateReportsModule {}
