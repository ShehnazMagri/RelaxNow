import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SuperAdminDashboardComponent } from './dashboard.component';
import { ForgotPasswordModule } from './../../forgot-password/forgot-password.module';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { MorrisJsModule } from 'angular-morris-js';

@NgModule({
  declarations: [SuperAdminDashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ForgotPasswordModule,
    DataTablesModule,
    NgbModule,
  ],
})
export class DashboardModule {}
