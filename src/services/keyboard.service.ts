import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent } from 'rxjs';

@UntilDestroy()
@Injectable()
export class KeyboardService {
    public key$ = fromEvent(document, 'keydown').pipe(untilDestroyed(this));
}
