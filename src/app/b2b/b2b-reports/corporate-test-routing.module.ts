import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminCorporateTestComponent } from './corporate-test.component';

const routes: Routes = [
  {
    path: '',
    component: AdminCorporateTestComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateTestRoutingModule {}
