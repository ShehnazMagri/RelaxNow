import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { DoctorsRoutingModule } from './doctors-routing.module';
import { DoctorsComponent } from './doctors.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [DoctorsComponent],
  imports: [CommonModule, DoctorsRoutingModule, DataTablesModule, FormsModule],
})
export class DoctorsModule {}
