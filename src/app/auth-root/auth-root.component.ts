import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIDIService } from 'src/services/midi.service';
import { StoreService } from 'src/services/store.service';

@Component({
  selector: 'app-auth-root',
  templateUrl: './auth-root.component.html',
  styleUrls: ['./auth-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StoreService, MIDIService]
})
export class AuthRootComponent {
}
