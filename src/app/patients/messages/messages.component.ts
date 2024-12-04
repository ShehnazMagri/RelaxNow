import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { ChatService } from 'src/app/core/services/chat/chat.service';
import { Channel } from 'twilio-chat/lib/channel';
import { Message } from 'twilio-chat/lib/message';
import { debounceTime } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user/user.service';
import { LoaderService } from 'src/app/core/services/loader/loader.service';
import { HttpService } from 'src/app/core/services/http/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit, OnDestroy {
  isConnected = false;
  isConnecting = false;
  isGettingChannels = false;
  channels: any[] = [];
  channelObj: any;
  chatMessage: string;
  currentChannel: Channel;
  typeObservable: any;
  messages: Message[] = [];
  currentUsername: string = localStorage.getItem('twackUsername');
  isMemberOfCurrentChannel = false;
  membersTyping: any = [];
  userSubscription: Subscription;
  userData;
  appointmentDetails: any = [];
  conSub: any;
  disconSub: any;
  searchText = '';
  doctorId = '0';
  @ViewChild('chatElement') chatElement: any;
  @ViewChild('chatDisplay') chatDisplay: any;
  doctorDetails;
  appointmentId = 0;
  chatId = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private user: UserService,
    private loader: LoaderService,
    private http: HttpService,
    private _location: Location
  ) {}

  ngOnInit() {
    this.loader.show();
    this.doctorId = this.route.snapshot.params.doc_id;
    this.appointmentId = this.route.snapshot.queryParams['appointmentId'] || 0;
    if (this.appointmentId) {
      this.getAppointmentDetails();
    }
    if (this.doctorId) {
      this.getDoctorProfile();
    }
    this.isConnecting = true;
    this.chatService.refreshToken();
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData && userData.result) {
          this.userData = userData.result[0];
        }
      }
    );
    this.conSub = this.chatService.chatConnectedEmitter.subscribe(() => {
      this.isConnected = true;
      this.isConnecting = false;

      this.chatService.chatClient.on('tokenExpired', () => {
        this.chatService.refreshToken();
      });
      if (this.chatService.chatClient && this.chatId) {
        this.enterChannel();
      }
    });

    this.disconSub = this.chatService.chatDisconnectedEmitter.subscribe(() => {
      this.isConnecting = false;
      this.isConnected = false;
    });
  }

  videoCall(): void {
    localStorage.setItem(
      'call_room',
      this.appointmentDetails.DOCTOR_FIRST_NAME +
        '' +
        this.appointmentDetails.DOCTOR_LAST_NAME
    );
    const params = {
      ToUserId: `${this.appointmentDetails.DOCTOR_ID}`,
      UserType: 'D',
      Room: `${
        this.appointmentDetails.DOCTOR_FIRST_NAME +
        '' +
        this.appointmentDetails.DOCTOR_LAST_NAME
      }`,
      appointmentId: `${this.appointmentDetails.RN_APPOINTMENT_ID}`,
      CallerId: `${this.appointmentDetails.CUSTOMER_ID}`,
      CallerType: 'P',
    };
    this.http.postData(ApiUrl.notifyUser, params).subscribe((resp) => {
      this.router.navigate(['/p/chat-portal', this.appointmentId]);
    });
  }
  enterChannel(): void {
    this.chatService.getChannel(this.chatId).then((channel) => {
      this.loader.hide();
      this.currentChannel = channel;
      this.currentChannel
        .join()
        .then((r) => {
          this.initChannel();
        })
        .catch((e) => {
          if (e.message.indexOf('already exists') > 0) {
            this.initChannel();
          }
        });
    });
  }
  /*** Get Doctor Profile ***/
  getDoctorProfile(): void {
    this.http
      .postData(ApiUrl.getPeopleInfo, { peopleId: this.doctorId })
      .subscribe(
        (resp: any) => {
          if (!!resp && resp.data) {
            const result = resp.data;
            this.doctorDetails = result;
          }
        },
        (error) => console.log(error)
      );
  }

  leaveChannel() {
    if (this.typeObservable) {
      this.typeObservable.unsubscribe();
    }
    if (this.currentChannel) {
      return this.currentChannel.leave().then((channel: Channel) => {
        channel.removeAllListeners('messageAdded');
        channel.removeAllListeners('typingStarted');
        channel.removeAllListeners('typingEnded');
      });
    } else {
      return Promise.resolve();
    }
  }

  getRecentMessages() {
    this.loader.hide();

    this.currentChannel.getMessages().then((msg) => {
      if (msg && msg.items && msg.items.length) {
        // console.log(msg);
        msg.items.forEach((m) => {
          this.messages.push(m);
        });
        const el = this.chatDisplay.nativeElement;
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        });
      }
    });
  }
  initChannel() {
    this.messages = [];

    this.getRecentMessages();
    this.typeObservable = fromEvent(this.chatElement.nativeElement, 'keyup')
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.typing();
      });
    this.currentChannel.on('messageAdded', (m) => {
      this.messages.push(m);
      console.log(m);
      const el = this.chatDisplay.nativeElement;
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      });
    });
    this.currentChannel.on('typingStarted', (m) => {
      this.membersTyping.push(m);
    });
    this.currentChannel.on('typingEnded', (m) => {
      const mIdx = this.membersTyping.findIndex(
        (mem) => mem.identity === m.identity
      );
      this.membersTyping = this.membersTyping.splice(mIdx, 0);
    });
  }

  typing() {
    this.currentChannel.typing();
  }

  sendMessage() {
    this.sendPushNotificationMessage(this.chatMessage);
    this.currentChannel.sendMessage(this.chatMessage);
    this.chatMessage = null;
  }

  convertAgoDate(time: string) {
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

  onFileSelect(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      this.currentChannel.sendMessage(formData);
    }
  }

  getAppointmentDetails(): void {
    const params = {
      query: `Call RN_APPOINTMENT_GET_BY_ID(${this.appointmentId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.loader.show();

          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.appointmentDetails = result[result.length - 1];
          this.chatId = result[0].Twilio_ID;
        }
      },
      (error) => console.log(error)
    );
  }
  downloadMedia(message): void {
    message.media.getContentTemporaryUrl().then((url) => {
      // log media temporary URL
      console.log('Media temporary URL is ' + url);
      window.open(url, '_blank');
    });
  }

  /*** Intiate User Call ***/
  callUser(people: any): void {
    const user = {
      name: people.Prefix + ' ' + people.FIRST_NAME + ' ' + people.LAST_NAME,
      image: people.BASE64CONTENT,
      userType: 1,
      mobile: people.Mobile,
    };
    this.user.setCallUser(user);
  }

  ngOnDestroy() {
    this.leaveChannel();
    if (this.conSub) {
      this.conSub.unsubscribe();
    }
    if (this.disconSub) {
      this.disconSub.unsubscribe();
    }
  }

  sendPushNotificationMessage(type): void {
    debugger;
    localStorage.setItem(
      'call_room',
      this.appointmentDetails.DOCTOR_FIRST_NAME +
        '' +
        this.appointmentDetails.DOCTOR_LAST_NAME
    );
    const params = {
      ToUserId: `${this.appointmentDetails.DOCTOR_ID}`,
      UserType: 'D',
      Room: `${
        this.appointmentDetails.DOCTOR_FIRST_NAME +
        '' +
        this.appointmentDetails.DOCTOR_LAST_NAME
      }`,
      appointmentId: `${this.appointmentDetails.RN_APPOINTMENT_ID}`,
      CallerId: `${this.appointmentDetails.CUSTOMER_ID}`,
      CallerType: ` ${this.appointmentDetails.RN_CUSTOMER_FIRST_NAME} : ${type}`,
    };
    this.http
      .postData(ApiUrl.notifyUsermessage, params)
      .subscribe((resp) => {});
  }

  backClicked() {
    this._location.back();
  }
}
