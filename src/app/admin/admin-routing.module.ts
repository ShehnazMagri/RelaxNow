import { B2bModule } from './../b2b/b2b.module';
import { CorporateAssesmentModule } from './../super-admin/corporate-assesment/corporate-assesment.module';
import { CorporateReportsModule } from './reports/corporate-test-reports/reports.module';
import { ReportsModule } from './reports/reports.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { LoginGuard } from '../core/guards/login.guard';
import { AdminComponent } from './admin.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'forgot-pass',
        loadChildren: () =>
          import(
            './pages/authendication/forgot-password/forgot-password.module'
          ).then((m) => m.ForgotPasswordModule),
      },
      {
        path: 'login',
        loadChildren: () =>
          import('./pages/authendication/login/login.module').then(
            (m) => m.LoginModule
          ),
      },
      {
        path: 'admin-invoice',
        loadChildren: () =>
          import('./invoice/admin-invoice.module').then(
            (m) => m.AdminInvoiceModule
          ),
      },
      {
        path: 'profile-settings',
        loadChildren: () =>
          import('./profile-settings/profile-settings.module').then(
            (m) => m.DocProfileModule
          ),
      },
      {
        path: 'lock-screen',
        loadChildren: () =>
          import('./pages/authendication/lock-screen/lock-screen.module').then(
            (m) => m.LockScreenModule
          ),
      },
      {
        path: 'register',
        loadChildren: () =>
          import('./pages/authendication/regiser/register.module').then(
            (m) => m.RegisterModule
          ),
      },
      {
        path: 'blank-page',
        loadChildren: () =>
          import('./pages/blank-page/blank-page.module').then(
            (m) => m.BlankPageModule
          ),
      },
      {
        path: 'error-first',
        loadChildren: () =>
          import('./pages/error-pages/error-first/error-first.module').then(
            (m) => m.ErrorFirstModule
          ),
      },
      {
        path: 'error-second',
        loadChildren: () =>
          import('./pages/error-pages/error-second/error-second.module').then(
            (m) => m.ErrorSecondModule
          ),
      },
      {
        path: 'components',
        loadChildren: () =>
          import('./ui-interface/components/components.module').then(
            (m) => m.ComponentsModule
          ),
      },
      {
        path: 'basic-input',
        loadChildren: () =>
          import('./ui-interface/forms/basic-inputs/basic-inputs.module').then(
            (m) => m.BasicInputsModule
          ),
      },
      {
        path: 'form-validation',
        loadChildren: () =>
          import(
            './ui-interface/forms/form-validation/form-validation.module'
          ).then((m) => m.FormValidationModule),
      },
      {
        path: 'horizondal-form',
        loadChildren: () =>
          import(
            './ui-interface/forms/horizondal-form/horizondal-form.module'
          ).then((m) => m.HorizondalFormModule),
      },
      {
        path: 'input-groups',
        loadChildren: () =>
          import('./ui-interface/forms/input-groups/input-groups.module').then(
            (m) => m.InputGroupsModule
          ),
      },
      {
        path: 'vertical-form',
        loadChildren: () =>
          import(
            './ui-interface/forms/vertical-form/vertical-form.module'
          ).then((m) => m.VerticalFormModule),
      },
      {
        path: 'form-mask',
        loadChildren: () =>
          import('./ui-interface/forms/form-mask/form-mask.module').then(
            (m) => m.FormMaskModule
          ),
      },
      {
        path: 'basic-tables',
        loadChildren: () =>
          import('./ui-interface/tables/basic-tables/basic-tables.module').then(
            (m) => m.BasicTablesModule
          ),
      },
      {
        path: 'admin-data-table',
        loadChildren: () =>
          import(
            './ui-interface/tables/admin-data-table/admin-data-table.module'
          ).then((m) => m.AdminDataTableModule),
      },
      {
        path: 'appointment',
        loadChildren: () =>
          import('./appointments/appointments.module').then(
            (m) => m.AppointmentsModule
          ),
      },
      {
        path: 'schedule-test',
        loadChildren: () =>
          import('./schedule-test/schedule-test.module').then(
            (m) => m.ScheduleTestModule
          ),
      },
      {
        path: 'schedule-test/:id',
        loadChildren: () =>
          import('./schedule-test/schedule-test.module').then(
            (m) => m.ScheduleTestModule
          ),
      },
      {
        path: 'scheduled-test-list',
        loadChildren: () =>
          import('./schedule-test-list/schedule-test-list.module').then(
            (m) => m.ScheduleTestListModule
          ),
      },
      {
        path: 'specialities',
        loadChildren: () =>
          import('./specialities/specialities.module').then(
            (m) => m.SpecialitiesModule
          ),
      },
      {
        path: 'blog',
        loadChildren: () =>
          import('./blog/blog/blog.module').then((m) => m.BlogModule),
      },
      {
        path: 'blog-details',
        loadChildren: () =>
          import('./blog/blog-details/blog-details.module').then(
            (m) => m.BlogDetailsModule
          ),
      },
      {
        path: 'add-blog',
        loadChildren: () =>
          import('./blog/add-blog/add-blog.module').then(
            (m) => m.AddBlogModule
          ),
      },
      {
        path: 'pending-blog',
        loadChildren: () =>
          import('./blog/pending-blog/pending-blog.module').then(
            (m) => m.PendingBlogModule
          ),
      },
      {
        path: 'edit-blog',
        loadChildren: () =>
          import('./blog/add-blog/add-blog.module').then(
            (m) => m.AddBlogModule
          ),
      },
      {
        path: 'product-list',
        loadChildren: () =>
          import('./product-list/product-list.module').then(
            (m) => m.ProductListModule
          ),
      },
      {
        path: 'pharmacy-list',
        loadChildren: () =>
          import('./pharmacy-list/pharmacy-list.module').then(
            (m) => m.PharmacyListModule
          ),
      },
      {
        path: 'doctor',
        loadChildren: () =>
          import('./doctors/doctors.module').then((m) => m.DoctorsModule),
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./patients/patients.module').then((m) => m.PatientsModule),
      },
      {
        path: 'transactions',
        loadChildren: () =>
          import('./transactions/transactions.module').then(
            (m) => m.TransactionsModule
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'reviews',
        loadChildren: () =>
          import('./reviews/reviews.module').then((m) => m.ReviewsModule),
      },
      {
        path: 'invoice-reports',
        loadChildren: () =>
          import('./invoice-reports/invoice-reports.module').then(
            (m) => m.InvoiceReportsModule
          ),
      },
      {
        path: 'ewi-controls',
        loadChildren: () =>
          import('./ewi-controls/ewi-controls.module').then(
            (m) => m.EwiControlsModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'on-boarding',
        loadChildren: () =>
          import('./on-boarding/on-boarding.module').then(
            (m) => m.OnBoardingModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'scheduletiming',
        loadChildren: () =>
          import('./scheduletiming/scheduletiming.module').then(
            (m) => m.ScheduletimingModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'coupons',
        loadChildren: () =>
          import('./coupons/coupons.module').then((m) => m.CouponsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./reports/reports.module').then((m) => m.ReportsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'schedule-test-reports',
        loadChildren: () =>
          import('./reports/schedule-test-report/schedule-reports.module').then(
            (m) => m.ScheduleReportsModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'Organizational-Clients',
        loadChildren: () =>
          import('./corporate/corporate.module').then((m) => m.CorporateModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'Organizational-Clients-assesment/:corporateId/:code',
        loadChildren: () =>
          import(
            './corporate/corporate-assesment/corporate-assesment.module'
          ).then((m) => m.CorporateAssesmentModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'Organizational-Clients-reports/:corporateId/:code',
        loadChildren: () =>
          import('./reports/corporate-test-reports/reports.module').then(
            (m) => m.CorporateReportsModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'Organizational-Assesments-reports/:code',
        loadChildren: () =>
          import('./reports/corporate-assesments-reports/reports.module').then(
            (m) => m.CorporateAssesmentReportsModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'Organizational-Clients-report',
        loadChildren: () =>
          import('./reports/corporate-test-report/corporate-test.module').then(
            (m) => m.CorporateTestModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'manage-password',
        loadChildren: () =>
          import('./manage-users/manage-users.module').then(
            (m) => m.ManageUsersModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'patient-details/:id',
        loadChildren: () =>
          import('./patient-details/patient-details.module').then(
            (m) => m.PatientDetailsModule
          ),
      },
      {
        path: 'logs',
        loadChildren: () =>
          import('./error-logs/error-logs.module').then(
            (m) => m.ErrorLogsModule
          ),
      },
      {
        path: 'cancelled-appointment',
        loadChildren: () =>
          import('./canceled-appointment/appointments.module').then(
            (m) => m.AppointmentsCanceledModule
          ),
      },
      {
        path: 'book-appointment',
        loadChildren: () =>
          import('../super-admin/book-appointment/booking.module').then(
            (m) => m.BookAppointmentModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'pending-appointment',
        loadChildren: () =>
          import(
            '../super-admin/pending-appointment/pending-appointments.module'
          ).then((m) => m.PendingAppointmentsModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'b2b-organizational-clients',
        loadChildren: () =>
          import('./b2bOrganizational/b2b-corporate.module').then(
            (m) => m.B2BCorporateModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'payment-configuration',
        loadChildren: () =>
          import('./payment-configuration/payment-configuration.module').then(
            (m) => m.PaymentConfigurationModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'payment-configuration/:code',
        loadChildren: () =>
          import('./payment-configuration/payment-configuration.module').then(
            (m) => m.PaymentConfigurationModule
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
