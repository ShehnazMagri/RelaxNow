import { QuestionsB2BComponent } from './../questions/questions.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [DashboardComponent, QuestionsB2BComponent],
  imports: [CommonModule, DashboardRoutingModule, NgbModule],
})
export class DashboardModule {}
