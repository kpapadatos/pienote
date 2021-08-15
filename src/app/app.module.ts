import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthRootComponent } from './auth-root/auth-root.component';
import { LoginComponent } from './login/login.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { TracklistComponent } from './sidenav/tracklist/tracklist.component';
import { GameComponent } from './game/game.component';
import { TrackComponent } from './track/track.component';
import { SeekBarComponent } from './seek-bar/seek-bar.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AuthRootComponent,
    SidenavComponent,
    TracklistComponent,
    GameComponent,
    TrackComponent,
    SeekBarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
