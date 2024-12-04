import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingRoutingModule } from './booking-routing.module';
import { BookingComponent } from './booking.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelect2Module } from 'ng-select2';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [BookingComponent],
  imports: [
    CommonModule,
    BookingRoutingModule,
    NgbModule,
    Daterangepicker,
    NgSelect2Module,
    FormsModule,
  ],
})
export class BookingModule {}
