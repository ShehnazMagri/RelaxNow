import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FirstAssessmentComponent } from './first-assessment.component';

const routes: Routes = [
  {
    path: '',
    component: FirstAssessmentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FirstAssessmentRoutingModule {}
