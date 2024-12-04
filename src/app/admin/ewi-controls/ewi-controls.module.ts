import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EwiControlsRoutingModule } from './ewi-controls-routing.module';
import { EwiControlsComponent } from './ewi-controls.component';
import { EwiTestComponent } from './ewi-test/ewi-test.component';
import { EwiAnswersComponent } from './ewi-answers/ewi-answers.component';
import { EwiQuestionsComponent } from './ewi-questions/ewi-questions.component';
import { EwiCategoriesComponent } from './ewi-categories/ewi-categories.component';
import { FormsModule } from '@angular/forms';
import { EwiGroupsComponent } from './ewi-groups/ewi-groups.component';
import { DataTablesModule } from 'angular-datatables';
import { NgSelect2Module } from 'ng-select2';
import { EwiTestRangeComponent } from './ewi-test-result-range/range.component';
import { NgxTextEditorModule } from '@joniras/ngx-editor2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ColorPickerModule } from 'ngx-color-picker';
import { AngularEditorModule } from '@kolkov/angular-editor';
@NgModule({
  declarations: [
    EwiControlsComponent,
    EwiTestComponent,
    EwiAnswersComponent,
    EwiQuestionsComponent,
    EwiCategoriesComponent,
    EwiGroupsComponent,
    EwiTestRangeComponent,
  ],
  imports: [
    CommonModule,
    EwiControlsRoutingModule,
    FormsModule,
    DataTablesModule,
    NgSelect2Module,
    NgxTextEditorModule,
    DragDropModule,
    ColorPickerModule,
    AngularEditorModule,
  ],
})
export class EwiControlsModule {}
