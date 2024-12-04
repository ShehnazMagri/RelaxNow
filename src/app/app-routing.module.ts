import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { LoginGuard } from './core/guards/login.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'home-one',
    loadChildren: () =>
      import('./home-one/home-one.module').then((m) => m.HomeOneModule),
  },
  {
    path: 'home-two',
    loadChildren: () =>
      import('./home-two/home-two.module').then((m) => m.HomeTwoModule),
  },
  {
    path: 'home-slider-one',
    loadChildren: () =>
      import('./home-slider-one/home-slider-one.module').then(
        (m) => m.HomeSliderOneModule
      ),
  },
  {
    path: 'home-slider-two',
    loadChildren: () =>
      import('./home-slider-two/home-slider-two.module').then(
        (m) => m.HomeSliderTwoModule
      ),
  },
  {
    path: 'doctor',
    loadChildren: () =>
      import('./doctor/doctor.module').then((m) => m.DoctorModule),
  },
  {
    path: 'p',
    loadChildren: () =>
      import('./patients/patients.module').then((m) => m.PatientsModule),
  },
  {
    path: 'pharmacy',
    loadChildren: () =>
      import('./pharmacy/pharmacy.module').then((m) => m.PharmacyModule),
  },
  {
    path: 'blank',
    loadChildren: () =>
      import('./blank/blank.module').then((m) => m.BlankModule),
  },
  {
    path: 'map-grid',
    loadChildren: () =>
      import('./map-grid/map-grid.module').then((m) => m.MapGridModule),
  },
  {
    path: 'calender',
    loadChildren: () =>
      import('./calender/calender.module').then((m) => m.CalenderModule),
  },
  {
    path: 'blog',
    loadChildren: () => import('./blog/blog.module').then((m) => m.BlogModule),
  },
  {
    path: 'blog-grid',
    loadChildren: () =>
      import('./blog-grid/blog-grid.module').then((m) => m.BlogGridModule),
  },
  {
    path: 'blog-details',
    loadChildren: () =>
      import('./blog-details/blog-details.module').then(
        (m) => m.BlogDetailsModule
      ),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'change-password/:id',
    loadChildren: () =>
      import('./change-password/change-password.module').then(
        (m) => m.ChangePasswordModule
      ),
  },
  {
    path: 'forgot-password',
    loadChildren: () =>
      import('./forgot-password/forgot-password.module').then(
        (m) => m.ForgotPasswordModule
      ),
  },

  {
    path: 'change-password/d/:id',
    loadChildren: () =>
      import('./doctor-change-password/change-password.module').then(
        (m) => m.DoctorChangePasswordModule
      ),
  },
  {
    path: 'forgot-password/d',
    loadChildren: () =>
      import('./doctor-forgot-password/forgot-password.module').then(
        (m) => m.DoctorForgotPasswordModule
      ),
  },

  {
    path: 'Register',
    loadChildren: () =>
      import('./register/register.module').then((m) => m.RegisterModule),
  },
  {
    path: 'OCR',
    loadChildren: () =>
      import('./corporate-register/register.module').then(
        (m) => m.CorporateRegisterModule
      ),
  },
  {
    path: 'Register/:id',
    loadChildren: () =>
      import('./register/register.module').then((m) => m.RegisterModule),
  },
  {
    path: 'video-call',
    loadChildren: () =>
      import('./videocall/videocall.module').then((m) => m.VideocallModule),
  },
  {
    path: 'voice-call',
    loadChildren: () =>
      import('./voicecall/voicecall.module').then((m) => m.VoicecallModule),
  },
  {
    path: 'invoice-details',
    loadChildren: () =>
      import('./invoice-details/invoice-details.module').then(
        (m) => m.InvoiceDetailsModule
      ),
  },
  {
    path: 'privacy-policy',
    loadChildren: () =>
      import('./privacy-policy/privacy-policy.module').then(
        (m) => m.PrivacyPolicyModule
      ),
  },
  {
    path: 'terms-conditions',
    loadChildren: () =>
      import('./terms-conditions/terms-conditions.module').then(
        (m) => m.TermsConditionsModule
      ),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'sadm',
    loadChildren: () =>
      import('./super-admin/super-admin.module').then(
        (m) => m.SuperAdminModule
      ),
  },
  {
    path: 'pharmacy-admin',
    loadChildren: () =>
      import('./pharmacy-admin/pharmacy-admin.module').then(
        (m) => m.PharmacyAdminModule
      ),
  },
  {
    path: 'checkout/:id',
    loadChildren: () =>
      import('./global-payment-checkout/checkout.module').then(
        (m) => m.GlobalCheckoutModule
      ),
  },
  {
    path: 'reception',
    loadChildren: () =>
      import('./reception/reception.module').then((m) => m.ReceptionModule),
  },
  {
    path: 'b2b',
    loadChildren: () =>
      import('./b2b/b2b.module').then((m) => m.B2bModule),
  },
  { path: '**', redirectTo: '/home' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
