import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { CameraComponent } from './camera/camera.component';
import { SettingsComponent } from './settings/settings.component';
import { ParticipantsComponent } from './participants/participants.component';
import { DeviceSelectComponent } from './settings/device-select.component';
import { RoomComponent } from './room/room.component';
import { FormsModule } from '@angular/forms';
import { ChatRoutingModule } from './chat-routing.module';
import { AngularEditorModule } from '@kolkov/angular-editor';

@NgModule({
  declarations: [
    ChatComponent,
    CameraComponent,
    SettingsComponent,
    ParticipantsComponent,
    DeviceSelectComponent,
    RoomComponent,
  ],
  imports: [CommonModule, ChatRoutingModule, AngularEditorModule, FormsModule],
})
export class ChatModule {}
