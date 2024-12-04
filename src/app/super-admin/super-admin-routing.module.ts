import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SuperAdminAuthGuard } from '../core/guards/super-admin.guard';
import { SuperAdminComponent } from './super-admin.component';
const routes: Routes = [
  {
    path: '',
    component: SuperAdminComponent,
    children: [
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'assesments',
        loadChildren: () =>
          import('./corporate-assesment/corporate-assesment.module').then(
            (m) => m.CorporateAssesmentModule
          ),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'medicine',
        loadChildren: () =>
          import('./medicine/medicine.module').then(
            (m) => m.AdminMedicineModule
          ),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'onboarding',
        loadChildren: () =>
          import('./on-boarding/on-boarding.module').then(
            (m) => m.OnBoardingModule
          ),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'manage-schedule',
        loadChildren: () =>
          import('./overide-schedule/booking.module').then(
            (m) => m.BookingModule
          ),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'manage-schedule/:id',
        loadChildren: () =>
          import('./overide-schedule/booking.module').then(
            (m) => m.BookingModule
          ),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'book-appointment',
        loadChildren: () =>
          import('./book-appointment/booking.module').then(
            (m) => m.BookAppointmentModule
          ),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'pending-appointment',
        loadChildren: () =>
          import('./pending-appointment/pending-appointments.module').then(
            (m) => m.PendingAppointmentsModule
          ),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'payment-configuration',
        loadChildren: () =>
          import(
            '../admin/payment-configuration/payment-configuration.module'
          ).then((m) => m.PaymentConfigurationModule),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'payment-configuration/:code',
        loadChildren: () =>
          import(
            '../admin/payment-configuration/payment-configuration.module'
          ).then((m) => m.PaymentConfigurationModule),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'invitations',
        loadChildren: () =>
          import('../admin/b2bOrganizational/b2b-corporate.module').then(
            (m) => m.B2BCorporateModule
          ),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('../admin/reports/reports.module').then(
            (m) => m.ReportsModule
          ),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'schedule-test-reports',
        loadChildren: () =>
          import(
            '../admin/reports/schedule-test-report/schedule-reports.module'
          ).then((m) => m.ScheduleReportsModule),
        canActivate: [SuperAdminAuthGuard],
      },
      {
        path: 'Organizational-Clients-report',
        loadChildren: () =>
          import(
            '../admin/reports/corporate-test-report/corporate-test.module'
          ).then((m) => m.CorporateTestModule),
        canActivate: [SuperAdminAuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuperAdminRoutingModule {}
