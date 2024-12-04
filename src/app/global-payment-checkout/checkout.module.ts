import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { NgxMaskModule, IConfig } from 'ngx-mask';

import { CorporateCheckoutRoutingModule } from './checkout-routing.module';
import { CorporateCheckoutComponent } from './checkout.component';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [CorporateCheckoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    CorporateCheckoutRoutingModule,
    NgxMaskModule.forRoot(),
  ],
})
export class GlobalCheckoutModule {}
