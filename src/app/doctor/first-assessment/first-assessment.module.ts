import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FirstAssessmentRoutingModule } from './first-assessment-routing.module';
import { FirstAssessmentComponent } from './first-assessment.component';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';

@NgModule({
  declarations: [FirstAssessmentComponent],
  imports: [
    CommonModule,
    FirstAssessmentRoutingModule,
    FormsModule,
    AngularEditorModule,
  ],
})
export class FirstAssessmentModule {}
