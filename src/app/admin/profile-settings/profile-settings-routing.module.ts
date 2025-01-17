import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DocProfileComponent } from './profile-settings.component';

const routes: Routes = [
  {
    path: '',
    component: DocProfileComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocProfileRoutingModule {}
