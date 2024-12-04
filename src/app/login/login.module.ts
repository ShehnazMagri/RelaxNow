import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoginRoutingModule,
    NgxMaskModule.forRoot(),
    NgbModule,
    ModalModule.forRoot(),
  ],
})
export class LoginModule {}
