import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminScheduleReportsComponent } from './schedule-reports.component';

const routes: Routes = [
  {
    path: '',
    component: AdminScheduleReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduleReportsRoutingModule {}
