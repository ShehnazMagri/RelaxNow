import { ScheduleTestComponent } from './schedule-test.component';
import { ScheduleTestRoutingModule } from './schedule-test-routing.module';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { NgSelect2Module } from 'ng-select2';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
@NgModule({
  declarations: [ScheduleTestComponent],
  imports: [
    CommonModule,
    ScheduleTestRoutingModule,
    NgbModule,
    NgSelect2Module,
    NgxCsvParserModule,
    FormsModule,
    ClipboardModule,
  ],
})
export class ScheduleTestModule {}
