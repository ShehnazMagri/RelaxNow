import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import Client from 'twilio-chat';
import { Channel } from 'twilio-chat/lib/channel';
import { ApiUrl } from '../../apiUrl';
import { HttpService } from '../http/http.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public chatClient: Client;
  public currentChannel: Channel;
  public chatConnectedEmitter: EventEmitter<any> = new EventEmitter<any>();
  public chatDisconnectedEmitter: EventEmitter<any> = new EventEmitter<any>();
  twakToken;
  constructor(
    private router: Router,
    private user: UserService,
    private http: HttpService
  ) {}

  connectTwilio(token) {
    Client.create(token)
      .then((client: Client) => {
        this.chatClient = client;
        this.chatConnectedEmitter.emit(true);
      })
      .catch((err: any) => {
        this.chatDisconnectedEmitter.emit(true);
        if (err.message.indexOf('token is expired')) {
        }
      });
  }

  getPublicChannels() {
    return this.chatClient.getPublicChannelDescriptors();
  }

  getChannel(sid: string): Promise<Channel> {
    return this.chatClient.getChannelBySid(sid);
  }
  getChannelByUniqueName(uniquename: string): Promise<Channel> {
    return this.chatClient.getChannelByUniqueName(uniquename);
  }

  createChannel(
    name: string,
    prvt: boolean = false,
    uniqueName: string
  ): Promise<Channel> {
    return this.chatClient.createChannel({
      friendlyName: name,
      isPrivate: prvt,
      uniqueName,
    });
  }

  refreshToken() {
    const params = {
      identity: this.user.currentUserValue.result[0].EMAIL,
    };

    this.http.postData(ApiUrl.twilioChatToken, params).subscribe(
      (response) => {
        if (!!response) {
          this.twakToken = response.data.token || '';
          localStorage.setItem('twilioChatToken', this.twakToken);
          this.connectTwilio(this.twakToken);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
