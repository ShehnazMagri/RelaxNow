import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesRoutingModule } from './services-routing.module';
import { ServicesComponent } from './services.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, ServicesRoutingModule, NgbModule],
})
export class ServicesdModule {}
