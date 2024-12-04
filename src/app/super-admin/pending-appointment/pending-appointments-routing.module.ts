import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PendingAppointmentsComponent } from './pending-appointments.component';

const routes: Routes = [
  {
    path: '',
    component: PendingAppointmentsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingAppointmentsRoutingModule {}
