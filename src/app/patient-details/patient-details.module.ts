import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientDetailsRoutingModule } from './patient-details-routing.module';
import { PatientDetailsComponent } from './patient-details.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgSelect2Module } from 'ng-select2';
@NgModule({
  declarations: [PatientDetailsComponent],
  imports: [
    CommonModule,
    PatientDetailsRoutingModule,
    FormsModule,
    NgbModule,
    HttpClientModule,
    AngularEditorModule,
    NgSelect2Module,
  ],
})
export class PatientDetailsModule {}
