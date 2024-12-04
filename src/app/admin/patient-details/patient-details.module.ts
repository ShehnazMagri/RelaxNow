import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientDetailsRoutingModule } from './patient-details-routing.module';
import { PatientDetailsComponent } from './patient-details.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
@NgModule({
  declarations: [PatientDetailsComponent],
  imports: [
    CommonModule,
    PatientDetailsRoutingModule,
    FormsModule,
    DataTablesModule,
    NgbModule,
    HttpClientModule,
  ],
})
export class PatientDetailsModule {}
