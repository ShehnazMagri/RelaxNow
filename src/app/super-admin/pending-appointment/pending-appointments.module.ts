import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PendingAppointmentsRoutingModule } from './pending-appointments-routing.module';
import { PendingAppointmentsComponent } from './pending-appointments.component';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Daterangepicker } from 'ng2-daterangepicker';
import { FormsModule } from '@angular/forms';
import { NgSelect2Module } from 'ng-select2';
@NgModule({
  declarations: [PendingAppointmentsComponent],
  imports: [
    CommonModule,
    PendingAppointmentsRoutingModule,
    DataTablesModule,
    NgbModule,
    Daterangepicker,
    FormsModule,
    NgSelect2Module,
  ],
})
export class PendingAppointmentsModule {}
