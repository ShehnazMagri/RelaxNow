import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OnBoardingComponent } from './on-boarding.component';

const routes: Routes = [
  {
    path: '',
    component: OnBoardingComponent
  },
  {
    path: 'details/:peopleId', loadChildren: () =>
      import('./settings/settings.module').then(
        (m) => m.SettingsModule
      )
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnBoardingRoutingModule { }
