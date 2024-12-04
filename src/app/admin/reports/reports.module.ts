import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { AdminReportsComponent } from './reports.component';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms';
import { Daterangepicker } from 'ng2-daterangepicker';
@NgModule({
  declarations: [AdminReportsComponent],
  imports: [CommonModule, ReportsRoutingModule, DataTablesModule, FormsModule,Daterangepicker],
})
export class ReportsModule {}
