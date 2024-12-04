import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReceptionComponent } from './reception.component';
import { ReceptionAuthGuard } from '../core/guards/reception.guard';

const routes: Routes = [
  {
    path: '',
    component: ReceptionComponent,
    children: [
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [ReceptionAuthGuard],
      },
      {
        path: 'appointment',
        loadChildren: () =>
          import('./appointments/appointments.module').then(
            (m) => m.AppointmentsModule
          ),
        canActivate: [ReceptionAuthGuard],
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./patients/patients.module').then((m) => m.PatientsModule),
      },
      {
        path: 'doctor',
        loadChildren: () =>
          import('./doctors/doctors.module').then((m) => m.DoctorsModule),
        canActivate: [ReceptionAuthGuard],
      },
      {
        path: 'doc-profile',
        loadChildren: () =>
          import('./doc-profile/doc-profile.module').then(
            (m) => m.DocProfileModule
          ),
      },
      {
        path: 'patient-details/:id',
        loadChildren: () =>
          import('./patient-details/patient-details.module').then(
            (m) => m.PatientDetailsModule
          ),
      },
      {
        path: 'book-appointment',
        loadChildren: () =>
          import('../super-admin/book-appointment/booking.module').then(
            (m) => m.BookAppointmentModule
          ),
        canActivate: [ReceptionAuthGuard],
      },
      {
        path: 'pending-appointment',
        loadChildren: () =>
          import(
            '../super-admin/pending-appointment/pending-appointments.module'
          ).then((m) => m.PendingAppointmentsModule),
        canActivate: [ReceptionAuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReceptionRoutingModule {}
