import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { ChatService } from 'src/app/core/services/chat/chat.service';
import { Channel } from 'twilio-chat/lib/channel';
import { Message } from 'twilio-chat/lib/message';
import { debounceTime } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user/user.service';
import { LoaderService } from 'src/app/core/services/loader/loader.service';
import { HttpService } from 'src/app/core/services/http/http.service';
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
  messageSubscription: Subscription;
  userData;
  appointments = [];
  allAppointments = [];
  conSub: any;
  disconSub: any;
  searchText = '';
  selectedUser;

  @ViewChild('chatElement') chatElement: any;
  @ViewChild('chatDisplay') chatDisplay: any;

  constructor(
    private chatService: ChatService,
    private user: UserService,
    private loader: LoaderService,
    private http: HttpService,
    private router: Router,
    private _location: Location
  ) {}

  ngOnInit() {
    this.loader.show();

    this.isConnecting = true;
    this.chatService.refreshToken();
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userData = userData.result[0];
          this.getAppointments();
        }
      }
    );
    this.conSub = this.chatService.chatConnectedEmitter.subscribe(() => {
      this.isConnected = true;
      this.isConnecting = false;
      this.getChannels();

      // this.chatService.chatClient.on('channelAdded', () => {
      //   this.getChannels();
      // });
      // this.chatService.chatClient.on('channelRemoved', () => {
      //   this.getChannels();
      // });
      this.chatService.chatClient.on('tokenExpired', () => {
        this.chatService.refreshToken();
      });
    });

    this.disconSub = this.chatService.chatDisconnectedEmitter.subscribe(() => {
      this.isConnecting = false;
      this.isConnected = false;
    });

    this.messageSubscription = this.user.loadMessagesSubject.subscribe(
      (userData) => {
        debugger;
        this.getAppointments();
      }
    );
  }

  getChannels() {
    this.isGettingChannels = true;
    this.chatService.getPublicChannels().then((channels: any) => {
      this.channelObj = channels;
      this.channels = this.channelObj.items;
      console.log(channels);
      this.isGettingChannels = false;
      this.loader.hide();
    });
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

  enterChannel(user): void {
    this.messages = [];
    this.membersTyping = [];
    this.selectedUser = user;
    this.MarkReadMessages(user.CUSTOMER_ID);
    user.UNREADMESSAGES = 0;
    this.chatService.getChannel(user.CHAT_ID).then((channel) => {
      this.currentChannel = channel;
      this.currentChannel
        .join()
        .then((r) => {
          this.initChannel();
          user.UNREADMESSAGES = 0;
        })
        .catch((e) => {
          if (e.message.indexOf('already exists') > 0) {
            this.initChannel();
          }
        });
    });
  }

  sendPushNotification(appointmentDetails): void {
    debugger;
    localStorage.setItem(
      'call_room',
      appointmentDetails.PEOPLE_ID + '' + appointmentDetails.RN_CUSTOMER_MOBILE
    );
    const params = {
      ToUserId: `${appointmentDetails.CUSTOMER_ID}`,
      UserType: 'P',
      Room: `${
        appointmentDetails.PEOPLE_ID +
        '' +
        appointmentDetails.RN_CUSTOMER_MOBILE
      }`,
      appointmentId: `${appointmentDetails.APPOINTMENT_ID}`,
      CallerId: `${appointmentDetails.PEOPLE_ID}`,
      CallerType: 'D',
    };
    this.http.postData(ApiUrl.notifyUser, params).subscribe((resp) => {
      debugger;
      this.router.navigate([
        '/doctor/chat-portal',
        appointmentDetails?.APPOINTMENT_ID,
      ]);
    });
  }

  sendPushNotificationMessage(appointmentDetails, type): void {
    localStorage.setItem(
      'call_room',
      appointmentDetails.DOCTOR_FIRST_NAME +
        '' +
        appointmentDetails.DOCTOR_LAST_NAME
    );
    const params = {
      ToUserId: `${appointmentDetails.CUSTOMER_ID}`,
      UserType: 'P',
      Room: `${
        appointmentDetails.DOCTOR_FIRST_NAME +
        '' +
        appointmentDetails.DOCTOR_LAST_NAME
      }`,
      appointmentId: `${appointmentDetails.RN_APPOINTMENT_ID}`,
      CallerId: `${appointmentDetails.DOCTOR_ID}`,
      CallerType: `DR. ${this.userData.FIRSTNAME} : ${type}`,
    };
    this.http
      .postData(ApiUrl.notifyUsermessage, params)
      .subscribe((resp) => {});
  }

  getRecentMessages() {
    this.loader.hide();

    this.currentChannel.getMessages().then((msg) => {
      if (msg && msg.items && msg.items.length) {
        console.log(msg);
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
      const mINdex = this.messages.findIndex(
        (msg: any) => msg.state.index === m.state.index
      );
      if (mINdex < 0) {
        this.messages.push(m);
      }
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
    this.sendPushNotificationMessage(this.selectedUser, this.chatMessage);
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
  getAppointments(): void {
    const params = {
      query: `call RN_GET_DOCTOR_PATIENTS_CHATS(${this.userData.USERID},'')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params, false).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.appointments = result;
          this.allAppointments = result;
          var userId = localStorage.getItem('ChatChannelID');
          debugger;
          if (userId != null && userId != '' && userId != undefined) {
            var user = this.allAppointments.find(
              (x) => x.CUSTOMER_ID == userId
            );
            this.enterChannel(user);
          }
        }
      },
      (error) => console.log(error)
    );
  }

  MarkReadMessages(mesageFrom): void {
    const params = {
      query: `call RN_MESSAGE_READ('${mesageFrom}','${this.userData.USERID}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params, false).subscribe(
      (resp: any) => {},
      (error) => console.log(error)
    );
  }

  filterUsersChat(searchText) {
    searchText = searchText.toLowerCase();
    this.appointments = this.allAppointments.filter((val: any) => {
      if (
        val.RN_CUSTOMER_LAST_NAME.toLowerCase().includes(searchText) ||
        val.RN_CUSTOMER_FIRST_NAME.toLowerCase().includes(searchText) ||
        val.RN_CUSTOMER_MIDDLE_NAME.toLowerCase().includes(searchText)
      ) {
        return val;
      }
    });
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
      name: people.RN_CUSTOMER_FIRST_NAME + ' ' + people.RN_CUSTOMER_LAST_NAME,
      image: people.Customer_IMAGE,
      userType: 0,
      mobile: people.RN_CUSTOMER_MOBILE,
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
  backClicked() {
    this._location.back();
  }
}
