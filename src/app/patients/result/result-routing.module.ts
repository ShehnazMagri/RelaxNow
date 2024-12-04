import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResultComponent } from './result.component';

const routes: Routes = [
  {
    path: '',
    component: UserResultComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserResultRoutingModule {}
