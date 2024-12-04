import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'niceDateFormatPipe',
})
export class niceDateFormatPipe implements PipeTransform {
  transform(value: string) {
    let _value = Number(value);

    const dif = Math.floor((Date.now() - _value) / 1000 / 86400);

    if (dif < 30) {
      return convertToNiceDate(value);
    } else {
      const datePipe = new DatePipe('en-US');
      value = datePipe.transform(value, 'MMM-dd-yyyy');
      return value;
    }
  }
}

function convertToNiceDate(time: string) {
  const date = new Date(time);
  const diff = (new Date().getTime() - date.getTime()) / 1000;
  const daydiff = Math.floor(diff / 86400);

  if (isNaN(daydiff) || daydiff < 0 || daydiff >= 31) {
    return '';
  }

  return (
    (daydiff === 0 &&
      ((diff < 60 && 'Just now') ||
        (diff < 120 && '1 minute ago') ||
        (diff < 3600 && Math.floor(diff / 60) + ' minutes ago') ||
        (diff < 7200 && '1 hour ago') ||
        (diff < 86400 && Math.floor(diff / 3600) + ' hours ago'))) ||
    (daydiff === 1 && 'Yesterday') ||
    (daydiff < 7 && daydiff + ' days ago') ||
    (daydiff < 31 && Math.ceil(daydiff / 7) + ' week(s) ago')
  );
}
