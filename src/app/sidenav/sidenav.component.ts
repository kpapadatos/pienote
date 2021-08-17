import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { MIDIService } from 'src/services/midi.service';
import { StoreService } from 'src/services/store.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent implements OnInit {
  public faSignOutAlt = faSignOutAlt;
  constructor(public store: StoreService, public midi: MIDIService) { }
  public ngOnInit(): void {
  }
}
