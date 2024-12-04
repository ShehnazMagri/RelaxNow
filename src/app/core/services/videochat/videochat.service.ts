import { connect, ConnectOptions, LocalTrack, Room } from 'twilio-video';
import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { HttpService } from '../http/http.service';
import { ApiUrl } from '../../apiUrl';
import { UserService } from '../user/user.service';

interface AuthToken {
  token: string;
}

export interface NamedRoom {
  id: string;
  name: string;
  maxParticipants?: number;
  participantCount: number;
}

export type Rooms = NamedRoom[];

@Injectable({
  providedIn: 'root',
})
export class VideoChatService {
  $roomsUpdated: Observable<boolean>;

  private roomBroadcast = new ReplaySubject<boolean>();

  constructor(private readonly http: HttpService, private user: UserService) {
    this.$roomsUpdated = this.roomBroadcast.asObservable();
  }

  private async getAuthToken() {
    const params = {
      identity: this.user.currentUserValue.result[0].EMAIL,
    };
    let twakToken = '';
    const result = await this.http
      .postData(ApiUrl.twilioVideoToken, params)
      .toPromise();
    if (!!result) {
      twakToken = result.data.token;
      localStorage.setItem('twilioVideoToken', twakToken);
    }
    return twakToken;
  }
  getAllRooms() {
    // return this.http.get<Rooms>('api/video/rooms').toPromise();
  }

  async joinOrCreateRoom(name: string, tracks: LocalTrack[]) {
    let room: Room = null;
    try {
      const token = await this.getAuthToken();
      room = await connect(token, {
        name,
        tracks,
        dominantSpeaker: true,
      } as ConnectOptions);
    } catch (error) {
      console.error(`Unable to connect to Room: ${error.message}`);
    } finally {
      if (room) {
        this.roomBroadcast.next(true);
      }
    }

    return room;
  }

  nudge() {
    this.roomBroadcast.next(true);
  }
}
