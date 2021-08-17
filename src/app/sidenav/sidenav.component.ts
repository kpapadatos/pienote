import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { faKeyboard, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { MIDIService } from 'src/services/midi.service';
import { StoreService } from 'src/services/store.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent implements OnInit {
  public faKeyboard = faKeyboard;
  public faSignOutAlt = faSignOutAlt;
  constructor(public store: StoreService, public midi: MIDIService) { }
  public ngOnInit(): void {
  }
}
