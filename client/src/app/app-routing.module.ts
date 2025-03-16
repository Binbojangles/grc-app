import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent } from './auth/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DomainsComponent } from './compliance/domains/domains.component';
import { ControlsComponent } from './compliance/controls/controls.component';
import { AssetsComponent } from './assets/assets.component';
import { PoliciesComponent } from './policies/policies.component';
import { AssessmentsComponent } from './assessments/assessments.component';
import { AssessmentDetailComponent } from './assessments/assessment-detail/assessment-detail.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';

// Guards
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'domains', component: DomainsComponent },
      { path: 'controls', component: ControlsComponent },
      { path: 'assets', component: AssetsComponent },
      { path: 'policies', component: PoliciesComponent },
      { path: 'assessments', component: AssessmentsComponent },
      { path: 'assessments/:id', component: AssessmentDetailComponent },
    ]
  },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 