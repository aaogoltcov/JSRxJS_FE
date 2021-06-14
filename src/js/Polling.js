'use strict';

import { ajax } from 'rxjs/ajax';
import {map, catchError, switchMap} from 'rxjs/operators';
import {interval, of, throwError} from 'rxjs';

export default class Polling {
  constructor() {
    this.url = 'https://jsrxjs.herokuapp.com/messages/unread';
    this.init();
  }

  init() {
    interval(1000)
      .pipe(
        switchMap(() => ajax.getJSON(this.url)),
        map(response => response.messages),
        catchError(error => {
          if (error.status > 500) {
            return throwError(new Error('internal server error'));
          }
          if (error.status > 400) {
            return throwError(new Error('invalid request'));
          }
          return of(null);
        })
      )
      .subscribe(messages => { this.drawMessages( messages ) })
  }

  drawMessages( messages ) {
    const alert = document.querySelector('.alert-primary');
    if ( !(messages === null) ) {
      if ( !alert.classList.contains('hidden') ) { alert.classList.add('hidden') }
      messages.forEach(element => {
        const subject = element.subject.length > 15 ? element.subject.substring(0, 14) + '...' : element.subject;
        document.querySelector('tbody').insertAdjacentHTML('afterbegin',
          `
            <tr>
              <td><a href="##email-read.html">${ element.from }</a></td>
              <td><a href="##email-read.html"><i class="fa text-info m-r-15">
                </i>${ subject }</a>
              </td>
              <td class="text-right">${ element.received }</td>
            </tr>
          `)
      })
    } else {
      if ( alert.classList.contains('hidden') ) { alert.classList.remove('hidden') }
    }
  }
}
