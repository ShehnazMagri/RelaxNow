import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorProfileRoutingModule } from './doctor-profile-routing.module';
import { DoctorProfileComponent } from './doctor-profile.component';
import { CrystalLightboxModule } from '@crystalui/angular-lightbox';
import { niceDateFormatPipe } from 'src/app/doctor/messages/dateFormat.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [DoctorProfileComponent, niceDateFormatPipe],
  imports: [
    CommonModule,
    DoctorProfileRoutingModule,
    CrystalLightboxModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class DoctorProfileModule {}
