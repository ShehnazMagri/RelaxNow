import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleTestListRoutingModule } from './schedule-test-list-routing.module';
import { ScheduleTestListComponent } from './schedule-test-list.component';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [ScheduleTestListComponent],
  imports: [CommonModule, ScheduleTestListRoutingModule, DataTablesModule],
})
export class ScheduleTestListModule {}
