import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuestionsRoutingModule } from './questions-routing.module';
import { QuestionsComponent } from './questions.component';
import { SafePipe } from 'src/app/core/pipes/safe.pipe';
import { SlickCarouselModule } from 'ngx-slick-carousel';
@NgModule({
  declarations: [QuestionsComponent, SafePipe],
  imports: [CommonModule, QuestionsRoutingModule,SlickCarouselModule],
})
export class QuestionsModule {}
