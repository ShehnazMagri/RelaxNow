import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDescComponent } from './product-desc.component';
import { ProductDescRoutingModule } from './product-desc-routing.module';
import { QuestionsB2BComponent } from '../questions/questions.component';

@NgModule({
  declarations: [ProductDescComponent, QuestionsB2BComponent],
  imports: [CommonModule, ProductDescRoutingModule],
})
export class ProductDescModule {}
