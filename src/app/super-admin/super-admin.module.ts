import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SuperAdminComponent } from './super-admin.component';
import { SuperAdminRoutingModule } from './super-admin-routing.module';
@NgModule({
  declarations: [SuperAdminComponent, SidemenuComponent],
  imports: [
    CommonModule,
    SuperAdminRoutingModule,
    NgbModule,
    ModalModule.forRoot(),
  ],
})
export class SuperAdminModule {}
