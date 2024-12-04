import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminCorporateReportsComponent } from './reports.component';

const routes: Routes = [
  {
    path: '',
    component: AdminCorporateReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateReportsRoutingModule {}
