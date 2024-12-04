import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientsRoutingModule } from './patients-routing.module';

import { PatientsComponent } from './patients.component';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentComponent } from './component/component.component';
import { ModalModule } from 'ngx-bootstrap/modal';
@NgModule({
  declarations: [PatientsComponent, SidemenuComponent, ComponentComponent],
  imports: [
    CommonModule,
    PatientsRoutingModule,
    NgbModule,
    NgbModule,
    ModalModule.forRoot(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PatientsModule {}
