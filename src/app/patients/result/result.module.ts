import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserResultRoutingModule } from './result-routing.module';
import { UserResultComponent } from './result.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgSelect2Module } from 'ng-select2';
import { FormsModule } from '@angular/forms';
import { SafePipe } from 'src/app/core/pipes/safe.pipe';


@NgModule({
  declarations: [UserResultComponent,SafePipe],
  imports: [
    CommonModule,
    UserResultRoutingModule,
    SlickCarouselModule,
    NgSelect2Module,
    FormsModule,
  ],
})
export class UserResultModule {}
