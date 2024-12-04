import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentConfigurationComponent } from './payment-configuration.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentConfigurationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentConfigurationRoutingModule {}
