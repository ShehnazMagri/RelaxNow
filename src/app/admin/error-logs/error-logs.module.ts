import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { ErrorLogsRoutingModule } from './error-logs-routing.module';
import { ErrorLogsComponent } from './error-logs.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [ErrorLogsComponent],
  imports: [
    CommonModule,
    ErrorLogsRoutingModule,
    DataTablesModule,
    FormsModule,
    NgbModule,
  ],
})
export class ErrorLogsModule {}
