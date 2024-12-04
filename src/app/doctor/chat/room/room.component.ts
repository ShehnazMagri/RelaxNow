import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
  Input,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  NamedRoom,
  VideoChatService,
} from 'src/app/core/services/videochat/videochat.service';
@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit, OnDestroy {
  @Output() roomChanged = new EventEmitter<string>();
  @Input() activeRoomName: string;

  roomName: string;
  rooms: NamedRoom[];

  private subscription: Subscription;

  constructor(private readonly videoChatService: VideoChatService) {}

  async ngOnInit() {
    // await this.updateRooms();
    // this.subscription = this.videoChatService.$roomsUpdated
    //   .pipe(tap((_) => this.updateRooms()))
    //   .subscribe();
    this.onJoinRoom("CH7a319394e0364d9eafcb68f9dd2df840")
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onTryAddRoom() {
    if (this.roomName) {
      this.onAddRoom(this.roomName);
    }
  }

  onAddRoom(roomName: string) {
    this.roomName = null;
    this.roomChanged.emit(roomName);
  }

  onJoinRoom(roomName: string) {
    this.roomChanged.emit(roomName);
  }

  async updateRooms() {
    // this.rooms = (await this.videoChatService.getAllRooms()) as NamedRoom[];
  }
}
