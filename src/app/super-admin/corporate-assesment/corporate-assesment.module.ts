import { CorporateAssesmentRoutingModule } from './corporate-assesment-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { AdminCorporateAssesmentComponent } from './corporate-assesment.component';
import { NgSelect2Module } from 'ng-select2';
import { NgxMaskModule } from 'ngx-mask';
import { QuestionsSSDMComponent } from '../questions/questions.component';
import { SuperAdminCorporateTestComponent } from '../corporate-test-report/corporate-test.component';
import { ChartsModule } from 'ng2-charts';
@NgModule({
  declarations: [
    QuestionsSSDMComponent,
    AdminCorporateAssesmentComponent,
    SuperAdminCorporateTestComponent,
  ],

  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    CorporateAssesmentRoutingModule,
    DataTablesModule,
    NgSelect2Module,
    NgxMaskModule.forRoot(),
    ChartsModule,
  ],
})
export class CorporateAssesmentModule {}
