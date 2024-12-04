import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReceptionRoutingModule } from './reception-routing.module';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import {ReceptionComponent } from './reception.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [SidemenuComponent,ReceptionComponent],
  imports: [
    CommonModule,
    ReceptionRoutingModule,
    NgbModule,
    ModalModule.forRoot()
  ]
})
export class ReceptionModule { }
