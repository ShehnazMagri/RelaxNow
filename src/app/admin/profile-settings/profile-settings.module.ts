import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocProfileComponent } from './profile-settings.component';
import { DocProfileRoutingModule } from './profile-settings-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [DocProfileComponent],
  imports: [
    CommonModule,
    DocProfileRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class DocProfileModule {}
