import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PatientBillingComponent } from './billing.component';

const routes: Routes = [
  {
    path: '',
    component: PatientBillingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillingRoutingModule {}
