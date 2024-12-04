import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DoctorGuard } from '../core/guards/doctor.guard';

import { DoctorComponent } from './doctor.component';
import { VisitorGuard } from './visitor.guard';

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
        canActivate: [DoctorGuard],
      },
      {
        path: 'appointment',
        loadChildren: () =>
          import('./appointments/appointments.module').then(
            (m) => m.AppointmentsModule
          ),
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./mypatients/mypatients.module').then(
            (m) => m.MypatientsModule
          ),
      },
      {
        path: 'patient-details/:id/:appointment_id',
        loadChildren: () =>
          import('../patient-details/patient-details.module').then(
            (m) => m.PatientDetailsModule
          ),
      },
      {
        path: 'scheduletiming',
        loadChildren: () =>
          import('./scheduletiming/scheduletiming.module').then(
            (m) => m.ScheduletimingModule
          ),
      },
      {
        path: 'invoice',
        loadChildren: () =>
          import('./invoice/invoice.module').then((m) => m.InvoiceModule),
      },
      {
        path: 'reviews',
        loadChildren: () =>
          import('./reviews/reviews.module').then((m) => m.ReviewsModule),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'social-media',
        loadChildren: () =>
          import('./social-media/social-media.module').then(
            (m) => m.SocialMediaModule
          ),
      },
      {
        path: 'message',
        loadChildren: () =>
          import('./messages/messages.module').then((m) => m.MessagesModule),
      },
      {
        path: 'login',
        loadChildren: () =>
          import('./login/login.module').then((m) => m.LoginModule),
      },
      {
        path: 'chat-portal/:appointment_id',
        loadChildren: () =>
          import('./chat/chat.module').then((m) => m.ChatModule),
      },
      {
        path: 'change-password',
        loadChildren: () =>
          import('./change-password/change-password.module').then(
            (m) => m.ChangePasswordModule
          ),
      },
      {
        path: 'assessment',
        loadChildren: () =>
          import('./assessment/assessment.module').then(
            (m) => m.AssessmentModule
          ),
        canActivate: [VisitorGuard],
      },
      {
        path: 'first-assessment/:id/:appointment_id',
        loadChildren: () =>
          import('./first-assessment/first-assessment.module').then(
            (m) => m.FirstAssessmentModule
          ),
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorRoutingModule {}
