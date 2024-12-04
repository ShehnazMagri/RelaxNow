import { FailedModule } from './failed/failed.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PatientGuard } from '../core/guards/patient.guard';

import { PatientsComponent } from './patients.component';

const routes: Routes = [
  {
    path: '',
    component: PatientsComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [PatientGuard],
      },
      {
        path: 'favourites',
        loadChildren: () =>
          import('./favourites/favourites.module').then(
            (m) => m.FavouritesModule
          ),
      },
      {
        path: 'booking',
        loadChildren: () =>
          import('./booking/booking.module').then((m) => m.BookingModule),
      },
      {
        path: 'component',
        loadChildren: () =>
          import('./component/component.module').then((m) => m.ComponentModule),
      },
      {
        path: 'patient-profile',
        loadChildren: () =>
          import('./patient-profile/patient-profile.module').then(
            (m) => m.PatientProfileModule
          ),
      },
      {
        path: 'add-billing',
        loadChildren: () =>
          import('./add-billing/add-billing.module').then(
            (m) => m.AddBillingModule
          ),
      },
      {
        path: 'edit-billing',
        loadChildren: () =>
          import('./edit-billing/edit-billing.module').then(
            (m) => m.EditBillingModule
          ),
      },
      {
        path: 'add-prescription',
        loadChildren: () =>
          import('./add-prescription/add-prescription.module').then(
            (m) => m.AddPrescriptionModule
          ),
      },
      {
        path: 'add-prescription',
        loadChildren: () =>
          import('./edit-prescription/edit-prescription.module').then(
            (m) => m.EditPrescriptionModule
          ),
      },
      {
        path: 'edit-prescription',
        loadChildren: () =>
          import('./add-prescription/add-prescription.module').then(
            (m) => m.AddPrescriptionModule
          ),
      },
      {
        path: 'doctor-profile/:docId',
        loadChildren: () =>
          import('./doctor-profile/doctor-profile.module').then(
            (m) => m.DoctorProfileModule
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'search-doctor',
        loadChildren: () =>
          import('./search-doctor/search-doctor.module').then(
            (m) => m.SearchDoctorModule
          ),
      },
      {
        path: 'message',
        loadChildren: () =>
          import('./../doctor/messages/messages.module').then(
            (m) => m.MessagesModule
          ),
      },
      {
        path: 'success/:appointment_id',
        loadChildren: () =>
          import('./success/success.module').then((m) => m.SuccessModule),
      },
      {
        path: 'failed',
        loadChildren: () =>
          import('./failed/failed.module').then((m) => m.FailedModule),
      },
      {
        path: 'checkout',
        loadChildren: () =>
          import('./checkout/checkout.module').then((m) => m.CheckoutModule),
        canActivate: [PatientGuard],
      },
      {
        path: 'questions',
        loadChildren: () =>
          import('./questions/questions.module').then((m) => m.QuestionsModule),
        canActivate: [PatientGuard],
      },
      {
        path: 'appointment-list',
        loadChildren: () =>
          import('./appointments/appointments.module').then(
            (m) => m.AppointmentsModule
          ),
        canActivate: [PatientGuard],
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./services/services.module').then((m) => m.ServicesdModule),
        canActivate: [PatientGuard],
      },
      {
        path: 'appointment-details/:appointment_id/:doc_id',
        loadChildren: () =>
          import('./appointment-details/patient-details.module').then(
            (m) => m.PatientDetailsModule
          ),
      },
      {
        path: 'change-password',
        loadChildren: () =>
          import('./change-password/change-password.module').then(
            (m) => m.ChangePasswordModule
          ),
      },
      {
        path: 'reviews',
        loadChildren: () =>
          import('./reviews/reviews.module').then((m) => m.ReviewsModule),
      },
      {
        path: 'billing',
        loadChildren: () =>
          import('./billing/billing.module').then(
            (m) => m.PatientBillingModule
          ),
      },
      {
        path: 'invoice/:appointment_id',
        loadChildren: () =>
          import('./invoice-details/invoice-details.module').then(
            (m) => m.InvoiceDetailsModule
          ),
      },
      {
        path: 'message/:doc_id',
        loadChildren: () =>
          import('./messages/messages.module').then((m) => m.MessagesModule),
      },
      {
        path: 'chat-portal/:appointment_id',
        loadChildren: () =>
          import('./chat/chat.module').then((m) => m.ChatModule),
      },
      {
        path: 'checkout/:id',
        loadChildren: () =>
          import('./checkout/checkout-corporate/checkout.module').then(
            (m) => m.CorporateCheckoutModule
          ),
        canActivate: [PatientGuard],
      },
      {
        path: 'product-desc/:ID',
        loadChildren: () =>
          import('../b2b/product-desc/product-desc.module').then(
            (m) => m.ProductDescModule
          ),
        canActivate: [PatientGuard],
      },
      {
        path: 'my-purchases',
        loadChildren: () =>
          import(
            '../b2b/purchase-history/purchase-history-corporate.module'
          ).then((m) => m.B2BPurchaseHistoryModule),
        canActivate: [PatientGuard],
      },
      {
        path: 'cart',
        loadChildren: () =>
          import('../b2b/cart/cart.module').then((m) => m.CartModule),
        canActivate: [PatientGuard],
      },
      {
        path: 'checkout-service',
        loadChildren: () =>
          import('../b2b/checkout-corporate/checkout.module').then(
            (m) => m.CorporateCheckoutModule
          ),
        canActivate: [PatientGuard],
      },
      {
        path: 'result',
        loadChildren: () =>
          import('./result/result.module').then((m) => m.UserResultModule),
        canActivate: [PatientGuard],
      },
      {
        path: 'test-details',
        loadChildren: () =>
          import('./test-intro/test-intro.module').then((m) => m.TestIntroModule),
        canActivate: [PatientGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientsRoutingModule {}
