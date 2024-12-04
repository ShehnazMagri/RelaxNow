import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ErrorLogsComponent } from './error-logs.component';

const routes: Routes = [
  {
    path: '',
    component: ErrorLogsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErrorLogsRoutingModule {}
