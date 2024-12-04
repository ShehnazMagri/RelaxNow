import { NotificationService } from './core/services/notification/notification.service';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  AfterViewInit,
  ViewEncapsulation,
  AfterViewChecked,
  OnDestroy,
  Inject,
  HostListener,
} from '@angular/core';
import {
  Event,
  NavigationStart,
  Router,
  ActivatedRoute,
} from '@angular/router';
import { DOCUMENT, Location } from '@angular/common';
import { CommonServiceService } from './common-service.service';
import { Subject, Subscription } from 'rxjs';
import { LoaderService } from './core/services/loader/loader.service';
import { UserService } from './core/services/user/user.service';
import { HttpService } from './core/services/http/http.service';
import { ApiUrl } from './core/apiUrl';
import { Device } from 'twilio-client';
import { MessageService } from './core/services/message/message.service';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
declare var $;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Relax Now';
  url;
  loadFooter = false;
  show = false;
  hideFooter = false;
  loaderSubscription: Subscription;
  paymentLoaderSubscription: Subscription;
  routerSubscription: Subscription;
  userSubscription: Subscription;
  callSubscription: Subscription;
  notificationSubscription: Subscription;
  showLoader = true;
  userToken = '';
  device: Device;
  userData;
  callingUser;
  receiverUser;
  showPaymentLoader = false;
  videoCallingData;
  ringtone = new Audio('assets/file/ring.mp3');
  connected;
  ongoingCall = false;
  routeUrl = '';
  private socket: Socket;

  constructor(
    @Inject(DOCUMENT) private document,
    private changeDetector: ChangeDetectorRef,
    public router: Router,
    private location: Location,
    public commonServic: CommonServiceService,
    private loaderService: LoaderService,
    private user: UserService,
    private http: HttpService,
    private notification: NotificationService,
    private route: ActivatedRoute,
    private msg: MessageService
  ) {
    const testParam = this.route.snapshot.params.id;
    this.routerSubscription = router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.routeUrl = event.url;
        if (
          event.url === '/login' ||
          event.url === '/doctor/login' ||
          event.url === '/forgot-password' ||
          event.url === '/forgot-password/d' ||
          event.url === '/Register'
        ) {
          document.querySelector('body').classList.add('account-page');
          document.querySelector('body').classList.remove('mat-typography');
        } else {
          document.querySelector('body').classList.remove('account-page');
          document.querySelector('body').classList.add('mat-typography');
        }
        if (event.url === '/map-grid') {
          this.hideFooter = true;
        }
        if (event.url === '/video-call' || event.url === '/voice-call') {
          document.querySelector('body').classList.add('call-page');
          document.querySelector('body').classList.remove('mat-typography');
        } else {
          document.querySelector('body').classList.remove('call-page');
          document.querySelector('body').classList.add('mat-typography');
        }
      }
    });
    this.url = location.path();
    this.show = this.url.includes('admin') ? false : true;
    this.show = this.url.includes('pharmacy-admin') ? false : true;
    this.commonServic.message.subscribe((res) => {
      if (res === 'admin' || res === 'pharmacy-admin') {
        this.show = false;
        this.hideFooter = true;
      } else if (res === 'main') {
        this.show = true;
        this.hideFooter = false;
      } else if (res === 'chat') {
        this.show = true;
        this.hideFooter = true;
      } else {
        this.show = true;
        this.hideFooter = false;
      }
    });
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData && userData.token) {
          this.userToken = userData.token;
          this.userData = userData.result[0];
          this.getCallingToken();
          this.socketSetting();
        }
      }
    );
    this.callSubscription = this.user.callingUserSubject.subscribe((data) => {
      if (data) {
        this.callingUser = data;
        this.voiceCall();
      } else {
        if ($('#voice_call')) {
          $('#voice_call').modal('hide');
          this.ongoingCall = false;
        }
      }
    });
    this.notificationSubscription = this.notification.currentMessage.subscribe(
      (message) => {
        if (message) {
          console.log('notification----', message);
          debugger;
          if (
            this.routeUrl.indexOf('/p/') > -1 ||
            this.routeUrl.indexOf('/doctor/') > -1
          ) {
            if (this.routeUrl.indexOf('/doctor/login') == -1) {
              if (message.data && message.data.Type === 'Video') {
                this.videoCallingData = message.data;
                if ($('#video_call')) {
                  $('#video_call').modal('show');
                  this.ringtone.loop = false;
                  this.ringtone.play();
                }
              }
              if (message.data && message.data.Type === 'message') {
                this.msg.showSuccessForMessage(message.data.callerType);
              }
            }
          }
        }
      }
    );
  }

  connectVideoCall(): void {
    this.ringtone.pause();
    $('#video_call').modal('hide');
    if (this.videoCallingData.callerType) {
      localStorage.setItem('call_room', this.videoCallingData.room);
      if (
        this.videoCallingData.room == null ||
        this.videoCallingData.room == ''
      ) {
        //alert('INVALID ROOM');
      }
      if (this.videoCallingData.callerType === 'D') {
        this.router.navigate([
          '/p/chat-portal',
          this.videoCallingData.appointmentId,
        ]);
      } else {
        this.router.navigate([
          '/doctor/chat-portal',
          this.videoCallingData.appointmentId,
        ]);
      }
    }
  }

  declineVideoCall(): void {
    this.ringtone.pause();
    $('#video_call').modal('hide');
    var role = 'D';
    if (this.userData.ROLE == 'CUSTOMER') {
      role = 'P';
    }
    const params = {
      ToUserId: `${this.videoCallingData.callerId}`,
      UserType: this.videoCallingData.callerType,
      Room: `${
        this.videoCallingData.callerId + ' ' + this.videoCallingData.callerType
      }`,
      appointmentId: `${this.videoCallingData.appointmentId}`,
      CallerId: `${this.userData.USERID}`,
      CallerType: role,
    };
    debugger;
    this.http
      .postData('/notification/send-push-declined', params)
      .subscribe((resp) => {});
  }
  ngOnInit() {
    setTimeout(async () => {
      this.loadFooter = true;
      await this.delay(1000);
      this.initializeFirebase();
    }, 1000);

    //state.show;
    //  var bbName=this.detectBrowserName();
    this.loaderSubscription = this.loaderService.loaderState.subscribe(
      (state) => {
        this.showLoader = state.show;
        this.changeDetector.detectChanges();
      }
    );
    //this.showLoader = false;
    this.paymentLoaderSubscription =
      this.loaderService.paymentloaderState.subscribe((state) => {
        this.showPaymentLoader = state.show;
        this.changeDetector.detectChanges();
      });
  }

  initializeFirebase() {
    // [
    //   'https://www.gstatic.com/firebasejs/7.6.0/firebase.js',
    //   'https://www.gstatic.com/firebasejs/7.6.0/firebase-app.js',
    //   'https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js',
    // ].forEach((js) => {
    //   const script = this.document.createElement('script');
    //   script.type = 'text/javascript';
    //   script.src = js;
    //   this.document.getElementsByTagName('head')[0].appendChild(script);
    // });
    // (async () => {
    //   await this.delay(2000);
    //   this.notification.firebaseInit();
    // })();
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /*** get Calling Token ***/
  getCallingToken() {
    const params = {
      identity: this.user.currentUserValue.result[0].MOBILE + 'abc',
      // identity: this.user.currentUserValue.result[0].FIRSTNAME,
    };

    this.http.getData(ApiUrl.twilioCallToken, params).subscribe(
      (response) => {
        if (!!response) {
          const twakToken = response.data || '';
          localStorage.setItem('twilioCallToken', twakToken);
          this.initTwilioCall(twakToken);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  /*** On dailing Call ***/
  async voiceCall() {
    const params = {
      to: this.callingUser.mobile + 'abc',
    };
    console.log(params);
    if (this.device) {
      const outgoingConnection = await this.device.connect(params);

      // const outgoingConnection = this.device.connect(params);
      outgoingConnection.on('ringing', () => {
        if ($('#voice_call')) {
          $('#voice_call').modal({
            show: true,
            backdrop: 'static',
            keyboard: false,
          });
        }
        this.ongoingCall = true;
      });

      outgoingConnection.on('reject', () => {
        if ($('#voice_call')) {
          $('#voice_call').modal('hide');
          this.ongoingCall = false;
        }
      });
      outgoingConnection.on('disconnect', () => {
        if ($('#voice_call')) {
          $('#voice_call').modal('hide');
          this.ongoingCall = false;
        }
      });
    }
  }

  /*** intilize Call ***/
  initTwilioCall(token) {
    try {
      this.device = new Device(token, {
        fakeLocalDTMF: true,
        enableRingingState: true,
        debug: true,
      });

      this.device.on('ready', (device) => {
        console.log('Twilio.Device Ready!');
      });

      this.device.on('error', (error) => {
        console.log('Twilio.Device Error: ' + error.message);
      });

      this.device.on('connect', (conn) => {
        console.log('Successfully established call ! ');
        // $('#modal-call-in-progress').modal('show')
      });

      this.device.on('disconnect', (conn) => {
        console.log('Call ended.');
        if ($('#incoming_call')) {
          $('#incoming_call').modal('hide');
          this.ongoingCall = false;
        }
      });

      this.device.on('cancel', (conn) => {
        console.log('Call cancel.');
        if ($('#incoming_call')) {
          $('#incoming_call').modal('hide');
          this.ongoingCall = false;
        }
      });
      this.device.on('offline', (conn) => {
        console.log('Offline---------');
      });
      this.device.on('incoming', (conn) => {
        this.connected = conn;
        console.log('incoming---------', conn.parameters);
        console.log('incoming---------', conn);
        // log("Incoming connection from " + conn.parameters.From);
        // $("#callerNumber").text(conn.parameters.From)
        // $("#txtPhoneNumber").text(conn.parameters.From)

        $('#incoming_call').modal({
          show: true,
          backdrop: 'static',
          keyboard: false,
        });

        // $('#btnReject').bind('click', function () {
        //   $('#incoming_call').modal('hide');
        //   console.log('Rejected call ...');
        //   conn.reject();
        // });

        // $('#btnAcceptCall').bind('click', function () {
        //   $('#btnAcceptCall').hide();
        //   console.log('Accepted call ...');
        //   conn.accept();
        // });
      });
    } catch (e) {
      console.log(e);
      console.log('Could not get a token from server!');
    }
  }

  /*** Disconnects the call ***/
  disconnectCall(): void {
    if (this.device) {
      this.device.disconnectAll();
      if ($('#voice_call')) {
        $('#voice_call').modal('hide');
        this.ongoingCall = false;
      }
    }
  }

  rejectCall(): void {
    this.connected.reject();
    $('#incoming_call').modal('hide');
    this.ongoingCall = false;
  }

  acceptCall(): void {
    this.connected.accept();
    this.ongoingCall = true;
  }

  ngOnDestroy(): void {
    this.showLoader = false;
    if (this.loaderSubscription) {
      this.loaderSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.callSubscription) {
      this.callSubscription.unsubscribe();
    }
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.paymentLoaderSubscription) {
      this.paymentLoaderSubscription.unsubscribe();
    }
  }

  socketSetting() {
    var role = 'D';
    if (this.userData.ROLE == 'CUSTOMER') {
      role = 'P';
    }
    var url = `https://noworrynotension.in?userid=${this.userData.USERID}&type=${role}&Type2=W`;
    var path = `/NodeTest/socket.io`;
    this.socket = io(url, {
      path: path,
    });
    // var url = `${environment.BASE_URL}?userid=${this.userData.USERID}&type=${role}&Type2=W`;
    // this.socket = io(url);
    this.socket.on('SocketResponseForNotification', (msg: any) => {
      if (msg) {
        var message = JSON.parse(msg);
        console.log('notification----', message);
        debugger;
        if (
          this.routeUrl.indexOf('/p/') > -1 ||
          this.routeUrl.indexOf('/doctor/') > -1
        ) {
          if (this.routeUrl.indexOf('/doctor/login') == -1) {
            if (message.data && message.data.Type === 'Video') {
              this.videoCallingData = message.data;
              debugger;
              localStorage.setItem('call_room', this.videoCallingData.room);
              if (
                this.videoCallingData.room == null ||
                this.videoCallingData.room == ''
              ) {
                // alert('INVALID ROOM');
              }
              if ($('#video_call')) {
                setTimeout(() => {
                  $('#video_call').modal('show');
                  this.ringtone.loop = false;
                  this.ringtone.play();
                }, 10000);
              }
            }
            if (message.data && message.data.Type === 'message') {
              this.msg.showSuccessForMessage(message.data.callerType);
              var date = new Date();
              this.user.loadMessagesSubject.next(date);
            }
            if (message.data && message.data.Type === 'declined') {
              this.location.back();
              // this.declineVideoCall();
            }
          }
        }
      }
    });
    this.socket.on('userSessionManage', (msg: any) => {
      //  var userId = JSON.parse(msg);
      var date = new Date();
      this.user.loadMessagesSubject.next(date);
    });
  }
}
