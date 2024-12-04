import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingRoutingModule } from './billing-routing.module';
import { PatientBillingComponent } from './billing.component';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [PatientBillingComponent],
  imports: [CommonModule, BillingRoutingModule, DataTablesModule],
})
export class PatientBillingModule {}
