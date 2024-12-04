import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminDataTableComponent } from './ui-interface/tables/admin-data-table/admin-data-table.component';

@NgModule({
  declarations: [AdminComponent, SidemenuComponent, AdminDataTableComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgbModule,
    ModalModule.forRoot()
  ]
})
export class AdminModule { }
