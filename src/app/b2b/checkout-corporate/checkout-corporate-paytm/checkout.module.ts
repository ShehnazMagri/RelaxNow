import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { NgxMaskModule, IConfig } from 'ngx-mask';

import { CorporatePaytmCheckoutRoutingModule } from './checkout-routing.module';
import { CorporatePaytmCheckoutComponent } from './checkout.component';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [CorporatePaytmCheckoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    CorporatePaytmCheckoutRoutingModule,
    NgxMaskModule.forRoot(),
  ],
})
export class CorporatePaytmCheckoutModule {}
