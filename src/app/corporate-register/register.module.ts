import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask';

import { CorporateRegisterRoutingModule } from './register-routing.module';
import { CorporateRegisterComponent } from './register.component';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [CorporateRegisterComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CorporateRegisterRoutingModule,
    NgxMaskModule.forRoot(),
  ],
})
export class CorporateRegisterModule {}
