import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScheduleTestListComponent } from './schedule-test-list.component';

const routes: Routes = [
  {
    path: '',
    component: ScheduleTestListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduleTestListRoutingModule {}
