import { AdminMedicineRoutingModule } from './medicine-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { AdminMedicineComponent } from './medicine.component';
import { NgSelect2Module } from 'ng-select2';
import { NgxMaskModule } from 'ngx-mask';
import { QuestionsSSDMComponent } from '../questions/questions.component';
import { ChartsModule } from 'ng2-charts';
@NgModule({
  declarations: [QuestionsSSDMComponent, AdminMedicineComponent],

  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    AdminMedicineRoutingModule,
    DataTablesModule,
    NgSelect2Module,
    NgxMaskModule.forRoot(),
    ChartsModule,
  ],
})
export class AdminMedicineModule {}
