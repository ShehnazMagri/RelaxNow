import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleReportsRoutingModule } from './schedule-reports-routing.module';
import { AdminScheduleReportsComponent } from './schedule-reports.component';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [AdminScheduleReportsComponent],
  imports: [
    CommonModule,
    ScheduleReportsRoutingModule,
    DataTablesModule,
    FormsModule,
  ],
})
export class ScheduleReportsModule {}
