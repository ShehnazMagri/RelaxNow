import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CorporateRegisterComponent } from './register.component';

const routes: Routes = [
  {
    path: '',
    component: CorporateRegisterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateRegisterRoutingModule {}
