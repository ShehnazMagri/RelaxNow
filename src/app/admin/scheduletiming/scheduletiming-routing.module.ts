import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeactivateSchedulingComponent } from './deactivate-scheduling/deactivate-scheduling.component';

import { ScheduletimingComponent } from './scheduletiming.component';

const routes: Routes = [
  {
    path: '',
    component: ScheduletimingComponent
  },
  {
    path: 'detail/:id',
    component: DeactivateSchedulingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduletimingRoutingModule { }
