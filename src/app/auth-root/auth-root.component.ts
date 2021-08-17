import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KeyboardService } from 'src/services/keyboard.service';
import { KeymapService } from 'src/services/keymap.service';
import { MIDIService } from 'src/services/midi.service';
import { StoreService } from 'src/services/store.service';

@Component({
  selector: 'app-auth-root',
  templateUrl: './auth-root.component.html',
  styleUrls: ['./auth-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StoreService, MIDIService, KeyboardService, KeymapService]
})
export class AuthRootComponent {
}
