import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CorporateAssesmentReportsRoutingModule } from './reports-routing.module';
import { AdminCorporateAssesmentReportsComponent } from './reports.component';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [AdminCorporateAssesmentReportsComponent],
  imports: [
    CommonModule,
    CorporateAssesmentReportsRoutingModule,
    DataTablesModule,
    FormsModule,
  ],
})
export class CorporateAssesmentReportsModule {}
