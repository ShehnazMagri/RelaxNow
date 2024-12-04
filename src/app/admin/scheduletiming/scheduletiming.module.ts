import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduletimingRoutingModule } from './scheduletiming-routing.module';
import { ScheduletimingComponent } from './scheduletiming.component';
import { NgSelect2Module } from 'ng-select2';
import { FormsModule } from '@angular/forms';
import { DeactivateSchedulingComponent } from './deactivate-scheduling/deactivate-scheduling.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [ScheduletimingComponent, DeactivateSchedulingComponent],
  imports: [
    NgSelect2Module,
    CommonModule,
    ScheduletimingRoutingModule,
    FormsModule,
    NgbModule
  ],
})
export class ScheduletimingModule { }
