import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestIntroRoutingModule } from './test-intro-routing.module';
import { TestIntroComponent } from './test-intro.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgSelect2Module } from 'ng-select2';
import { FormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [TestIntroComponent],
  imports: [
    CommonModule,
    TestIntroRoutingModule,
    SlickCarouselModule,
    NgSelect2Module,
    FormsModule,
    DataTablesModule
  ],
})
export class TestIntroModule {}
