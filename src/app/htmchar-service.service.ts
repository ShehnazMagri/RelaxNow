import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HtmlCharService {
  constructor() {}

  HtmlEncode(str): string {
    if (str && str.length) {
      let i = str.length;
      const aRet = [];

      while (i--) {
        const iC = str[i].charCodeAt();
        if (iC < 65 || iC > 127 || (iC > 90 && iC < 97)) {
          aRet[i] = '&#' + iC + ';';
        } else {
          aRet[i] = str[i];
        }
      }
      return aRet.join('');
    }
    return '';
  }
  decodeHtmlCharCodes(str): string {
    if (str && str.length) {
      return str.replace(/(&#(\d+);)/g, (match, capture, charCode) => {
        return String.fromCharCode(charCode);
      });
    }
    return '';
  }
}
