import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { AssessmentsComponent } from './assessments/assessments.component';
import { AssessmentDetailComponent } from './assessments/assessment-detail/assessment-detail.component';
import { ControlsComponent } from './controls/controls.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardComponent },
  { path: 'assessments', component: AssessmentsComponent },
  { path: 'assessments/:id', component: AssessmentDetailComponent },
  { path: 'controls', component: ControlsComponent },
  { path: '**', component: NotFoundComponent }
];
