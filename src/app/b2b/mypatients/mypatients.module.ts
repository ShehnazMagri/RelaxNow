import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MypatientsRoutingModule } from './mypatients-routing.module';
import { MypatientsComponent } from './mypatients.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FormsModule } from '@angular/forms';
import { NgSelect2Module } from 'ng-select2';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  declarations: [MypatientsComponent],
  imports: [
    CommonModule,
    MypatientsRoutingModule,
    Ng2SearchPipeModule,
    FormsModule,
    NgbModule,
    NgSelect2Module,
  ],
})
export class MypatientsModule {}
