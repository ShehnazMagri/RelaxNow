import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { NgxMaskModule, IConfig } from 'ngx-mask';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutComponent } from './checkout.component';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [CheckoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    CheckoutRoutingModule,
    NgxMaskModule.forRoot(),
  ],
})
export class CheckoutModule {}
