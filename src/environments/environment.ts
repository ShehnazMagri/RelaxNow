// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // BASE_URL: 'https://noworrynotension.in/NodeTest',
  //BASE_URL: 'http://13.235.195.100/NodeTest',
  BASE_URL: 'http://localhost:8008',
  firebase: {
    apiKey: 'AIzaSyAVTEMbI8na-OuJadWezOvK52BXnBkRDl0',
    authDomain: 'relax-now-16d88.firebaseapp.com',
    projectId: 'relax-now-16d88',
    storageBucket: 'relax-now-16d88.appspot.com',
    messagingSenderId: '837516012729',
    appId: '1:837516012729:web:b944eab81a490ab498bf68',
    measurementId: 'G-GS79NY8QYJ',
  },
  //BASE_URL: 'http://103.91.90.242/NodeTest',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
