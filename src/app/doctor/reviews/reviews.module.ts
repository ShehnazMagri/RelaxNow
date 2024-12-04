import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReviewsRoutingModule } from './reviews-routing.module';
import { ReviewsComponent } from './reviews.component';
import { niceDateFormatPipe } from 'src/app/patients/messages/dateFormat.pipe';

@NgModule({
  declarations: [ReviewsComponent, niceDateFormatPipe],
  imports: [CommonModule, ReviewsRoutingModule],
})
export class ReviewsModule {}
