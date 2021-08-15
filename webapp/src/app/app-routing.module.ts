import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/guards/auth.guard';
import { LoginGuard } from 'src/guards/login.guard';
import { AuthRootComponent } from './auth-root/auth-root.component';
import { GameComponent } from './game/game.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/app'
  },
  {
    path: 'app',
    canActivate: [AuthGuard],
    component: AuthRootComponent,
    children: [
      {
        path: ':trackId',
        component: GameComponent
      }
    ]
  },
  {
    path: 'login',
    canActivate: [LoginGuard],
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [AuthGuard, LoginGuard],
  exports: [RouterModule]
})
export class AppRoutingModule { }
