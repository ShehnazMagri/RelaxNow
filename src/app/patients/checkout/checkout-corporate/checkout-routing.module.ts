import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CorporateCheckoutComponent } from './checkout.component';

const routes: Routes = [
  {
    path: '',
    component: CorporateCheckoutComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateCheckoutRoutingModule {}
