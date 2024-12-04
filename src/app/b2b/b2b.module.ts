import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { B2bRoutingModule } from './b2b-routing.module';
import { DoctorComponent } from './b2b.component';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [DoctorComponent, SidemenuComponent],
  imports: [CommonModule, B2bRoutingModule, ModalModule.forRoot()],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class B2bModule {}
