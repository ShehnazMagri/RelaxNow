import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminCorporateAssesmentReportsComponent } from './reports.component';

const routes: Routes = [
  {
    path: '',
    component: AdminCorporateAssesmentReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateAssesmentReportsRoutingModule {}
