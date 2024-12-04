import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CorporatePaytmCheckoutComponent } from './checkout.component';

const routes: Routes = [
  {
    path: '',
    component: CorporatePaytmCheckoutComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporatePaytmCheckoutRoutingModule {}
