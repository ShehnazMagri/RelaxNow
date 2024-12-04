import { environment as env } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiUrl } from '../../apiUrl';
import { HttpService } from '../http/http.service';
import { UserService } from '../user/user.service';
declare const firebase: any;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  currentMessage = new BehaviorSubject(null);

  constructor(private http: HttpService, private user: UserService) {}

  fcmMessaging(messaging) {
    messaging.onMessage((payload) => {
      console.log('notification----', payload);

      if (payload) {
        this.currentMessage.next(payload);
      }
    });
  }

  firebaseInit() {
    // const firebaseConfig = {
    //   apiKey: env.firebase.apiKey,
    //   authDomain: env.firebase.authDomain,
    //   projectId: env.firebase.projectId,
    //   storageBucket: env.firebase.storageBucket,
    //   messagingSenderId: env.firebase.messagingSenderId,
    //   appId: env.firebase.appId,
    // };
    // if (!firebase.apps.length) {
    //   firebase.initializeApp(firebaseConfig);
    //   if (firebase.messaging.isSupported()) {
    //     const messaging = firebase.messaging();
    //     this.fcmMessaging(messaging);
    //     navigator.serviceWorker
    //       .register(
    //         `firebase-messaging-sw.js?messagingSenderId=${firebaseConfig.messagingSenderId}&apiKey=${firebaseConfig.apiKey}&authDomain=${firebaseConfig.authDomain}&&projectId=${firebaseConfig.projectId}&storageBucket=${firebaseConfig.storageBucket}&appId=${firebaseConfig.appId}`
    //       )
    //       .then((registration) => {
    //         messaging.useServiceWorker(registration);
    //         messaging
    //           .requestPermission()
    //           .then(() => {
    //             this.getToken(messaging);
    //           })
    //           .catch((err) => {});
    //       });
    //     messaging.onTokenRefresh(() => {
    //       this.getToken(messaging);
    //     });
    //   }
    // } else {
    //   const messaging = firebase.messaging();
    //   this.fcmMessaging(messaging);
    //   this.getToken(messaging);
    // }
  }

  getToken(messaging) {
    messaging
      .getToken()
      .then((refreshedToken) => {
        debugger;
        if (refreshedToken) {
          this.user.currentUserSubject.subscribe((userData) => {
            if (userData) {
              localStorage.setItem('fcm_token', refreshedToken);
              this.setUserToken(userData);
            }
          });
        }
      })
      .catch((err) => {});
  }

  setUserToken(userData) {
    // var role = 'D';
    // if (userData.result[0].ROLE == 'CUSTOMER') {
    //   role = 'P';
    // }
    // const fcmToken = localStorage.getItem('fcm_token') || '';
    // const params = {
    //   query: `call RN_MANAGE_USER_PUSH_NOTIFICATION('${userData.result[0].USERID}','${role}','${fcmToken}','A')`,
    //   params: '',
    // };
    // this.http.postData(ApiUrl.queryExecute, params, false).subscribe(
    //   (response) => {
    //     if (!!response) {
    //     }
    //   },
    //   (err) => {
    //     console.log(err);
    //   }
    // );
  }
}
