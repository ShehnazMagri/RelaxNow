import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms';
import { ServicesComponent } from '../services/services.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [DashboardComponent, ServicesComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    DataTablesModule,
    FormsModule,
    NgbModule,
  ],
})
export class DashboardModule {}
