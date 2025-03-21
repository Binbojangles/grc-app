import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DomainsComponent } from './compliance/domains/domains.component';
import { ControlsComponent } from './compliance/controls/controls.component';
import { AssetsComponent } from './assets/assets.component';
import { PoliciesComponent } from './policies/policies.component';
import { AssessmentsComponent } from './assessments/assessments.component';
import { AssessmentDetailComponent } from './assessments/assessment-detail/assessment-detail.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { OrganizationListComponent } from './organizations/organization-list/organization-list.component';
import { OrganizationDetailComponent } from './organizations/organization-detail/organization-detail.component';
import { DepartmentListComponent } from './departments/department-list/department-list.component';

// Guards
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
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
      { path: 'users', component: UserListComponent },
      { path: 'organizations', component: OrganizationListComponent },
      { path: 'organizations/:id', component: OrganizationDetailComponent },
      { path: 'departments', component: DepartmentListComponent },
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