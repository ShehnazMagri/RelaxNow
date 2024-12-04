import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EwiAnswersComponent } from './ewi-answers/ewi-answers.component';
import { EwiCategoriesComponent } from './ewi-categories/ewi-categories.component';
import { EwiControlsComponent } from './ewi-controls.component';
import { EwiGroupsComponent } from './ewi-groups/ewi-groups.component';
import { EwiQuestionsComponent } from './ewi-questions/ewi-questions.component';
import { EwiTestRangeComponent } from './ewi-test-result-range/range.component';
import { EwiTestComponent } from './ewi-test/ewi-test.component';

const routes: Routes = [
  {
    path: '',
    component: EwiControlsComponent,
    children: [
      { path: '', redirectTo: 'tests', pathMatch: 'full' },
      { path: 'tests', component: EwiTestComponent },
      { path: 'categories', component: EwiCategoriesComponent },
      { path: 'questions', component: EwiQuestionsComponent },
      { path: 'answers', component: EwiAnswersComponent },
      { path: 'groups', component: EwiGroupsComponent },
      { path: 'test-range', component: EwiTestRangeComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EwiControlsRoutingModule {}
