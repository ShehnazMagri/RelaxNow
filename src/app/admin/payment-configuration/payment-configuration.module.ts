import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentConfigurationRoutingModule } from './payment-configuration-routing.module';
import { PaymentConfigurationComponent } from './payment-configuration.component';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Daterangepicker } from 'ng2-daterangepicker';
@NgModule({
  declarations: [PaymentConfigurationComponent],
  imports: [
    CommonModule,
    PaymentConfigurationRoutingModule,
    DataTablesModule,
    NgbModule,
    Daterangepicker,
    FormsModule,
  ],
})
export class PaymentConfigurationModule {}
