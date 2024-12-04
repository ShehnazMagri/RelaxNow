import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxMaskModule, IConfig } from 'ngx-mask';

import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms';

import { OnBoardingRoutingModule } from './on-boarding-routing.module';
import { OnBoardingComponent } from './on-boarding.component';
import { TagInputModule } from 'ngx-chips';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [OnBoardingComponent],
  imports: [
    CommonModule,
    OnBoardingRoutingModule,
    DataTablesModule,
    FormsModule,
    TagInputModule,
    NgbModule,
    NgxMaskModule.forRoot(),
  ],
})
export class OnBoardingModule {}
