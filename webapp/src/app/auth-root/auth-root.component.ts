import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { StoreService } from 'src/services/store.service';

@Component({
  selector: 'app-auth-root',
  templateUrl: './auth-root.component.html',
  styleUrls: ['./auth-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StoreService]
})
export class AuthRootComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
