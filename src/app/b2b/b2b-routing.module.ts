import { CorporateAssesmentModule } from './../super-admin/corporate-assesment/corporate-assesment.module';
import { CheckoutModule } from './../patients/checkout/checkout.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { B2BGuard } from '../core/guards/aut,b2b-guard';

import { DoctorComponent } from './b2b.component';

const routes: Routes = [
  {
    path: '',
    component: DoctorComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [B2BGuard],
      },

      {
        path: 'patients',
        loadChildren: () =>
          import('./mypatients/mypatients.module').then(
            (m) => m.MypatientsModule
          ),
        canActivate: [B2BGuard],
      },
      {
        path: 'patient-details/:id/:appointment_id',
        loadChildren: () =>
          import('../patient-details/patient-details.module').then(
            (m) => m.PatientDetailsModule
          ),
        canActivate: [B2BGuard],
      },
      {
        path: 'login/:token',
        loadChildren: () =>
          import('./login/login.module').then((m) => m.LoginModule),
      },
      {
        path: 'login',
        loadChildren: () =>
          import('./login/login.module').then((m) => m.LoginModule),
      },
      {
        path: 'change-password',
        loadChildren: () =>
          import('./change-password/change-password.module').then(
            (m) => m.ChangePasswordModule
          ),
        canActivate: [B2BGuard],
      },
      {
        path: 'cart',
        loadChildren: () =>
          import('./cart/cart.module').then((m) => m.CartModule),
        canActivate: [B2BGuard],
      },
      {
        path: 'product-desc/:ID',
        loadChildren: () =>
          import('./product-desc/product-desc.module').then(
            (m) => m.ProductDescModule
          ),
        canActivate: [B2BGuard],
      },
      {
        path: 'checkout',
        loadChildren: () =>
          import('./checkout-corporate/checkout.module').then(
            (m) => m.CorporateCheckoutModule
          ),
        canActivate: [B2BGuard],
      },
      {
        path: 'assesment/:cartId',
        loadChildren: () =>
          import('./corporate-assesment/corporate-assesment.module').then(
            (m) => m.CorporateAssesmentModule
          ),
        canActivate: [B2BGuard],
      },
      {
        path: 'my-purchases',
        loadChildren: () =>
          import('./purchase-history/purchase-history-corporate.module').then(
            (m) => m.B2BPurchaseHistoryModule
          ),
        canActivate: [B2BGuard],
      },
      {
        path: 'reports/:code',
        loadChildren: () =>
          import('../admin/reports/corporate-test-reports/reports.module').then(
            (m) => m.CorporateReportsModule
          ),
        canActivate: [B2BGuard],
      },
      {
        path: 'assesments-reports/:code',
        loadChildren: () =>
          import(
            '../admin/reports/corporate-assesments-reports/reports.module'
          ).then((m) => m.CorporateAssesmentReportsModule),
        canActivate: [B2BGuard],
      },
      {
        path: 'report',
        loadChildren: () =>
          import('./b2b-reports/corporate-test.module').then(
            (m) => m.CorporateTestModule
          ),
        canActivate: [B2BGuard],
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../patients/settings/settings.module').then(
            (m) => m.SettingsModule
          ),
        canActivate: [B2BGuard],
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class B2bRoutingModule {}
