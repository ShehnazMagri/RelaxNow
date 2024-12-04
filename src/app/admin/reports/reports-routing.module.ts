import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminReportsComponent } from './reports.component';

const routes: Routes = [
  {
    path: '',
    component: AdminReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
