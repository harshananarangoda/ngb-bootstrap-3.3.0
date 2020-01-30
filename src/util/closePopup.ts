import { NgZone } from '@angular/core';
import { race, fromEvent, Observable } from 'rxjs';
import { filter, tap, map, withLatestFrom, takeUntil, delay } from 'rxjs/operators';
import { Key } from './key';

export function ClosePopup(zone: NgZone, document: Document, clickableElement: HTMLElement,
  closePopup: () => void, closed$: Observable<any>,) {

    zone.runOutsideAngular(() => {

      const escapes$ = fromEvent<KeyboardEvent>(document, 'keydown')
                           .pipe(
                               filter(e => e.which === Key.Escape));

      // Added due to problem occured when element detach from DOM
      const mouseDowns$ = fromEvent<MouseEvent>(document, 'mousedown').pipe(
        map((event) => {
          return !clickableElement.contains(event.target as HTMLElement)
        })
      );

      const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup').pipe(
        withLatestFrom(mouseDowns$), filter(([event, downeventFilter]) => downeventFilter),
        takeUntil(closed$)
      );

      race([escapes$, mouseUp$]).subscribe(() => {
        zone.run(closePopup)
      });
    })

}

const isContainedIn = (element: HTMLElement, array?: HTMLElement[]) =>
    array ? array.some(item => item.contains(element)) : false;
