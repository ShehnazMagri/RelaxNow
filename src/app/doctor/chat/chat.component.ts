import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  createLocalAudioTrack,
  Room,
  LocalTrack,
  LocalVideoTrack,
  LocalAudioTrack,
  RemoteParticipant,
} from 'twilio-video';
import { VideoChatService } from '../../core/services/videochat/videochat.service';
import { CameraComponent } from './camera/camera.component';
import { ParticipantsComponent } from './participants/participants.component';
import { RoomComponent } from './room/room.component';
import { SettingsComponent } from './settings/settings.component';
import { LoaderService } from 'src/app/core/services/loader/loader.service';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/core/services/user/user.service';
import { HtmlCharService } from 'src/app/htmchar-service.service';
import { MessageService } from 'src/app/core/services/message/message.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('rooms') rooms: RoomComponent;
  @ViewChild('participantcamera') participantcamera: CameraComponent;
  @ViewChild('settings') settings: SettingsComponent;
  @ViewChild('participants') participants: ParticipantsComponent;

  activeRoom: Room;
  muteAudio = false;
  hideVideo = false;
  counter = '00:00';
  interval = 0;
  countDownInterval;
  appointmentId = 0;
  notesType = 1;
  prescription = '';
  appointmentDetails;
  romm = '';
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['undo', 'redo', 'subscript', 'superscript', 'indent', 'outdent'],
      [
        'backgroundColor',
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode',
      ],
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };
  userSubscription: Subscription;
  userRole;
  constructor(
    private route: ActivatedRoute,
    private readonly videoChatService: VideoChatService,
    private location: Location,
    private user: UserService,
    private loader: LoaderService,
    private htmlCharService: HtmlCharService,
    private message: MessageService,
    private http: HttpService
  ) {}

  async ngOnInit() {
    this.loader.show();

    this.appointmentId = this.route.snapshot.params.appointment_id;
    if (this.appointmentId) {
      this.getAppointmentDetails();
    }

    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userRole = userData.result[0].ROLE;
        }
      }
    );
  }

  async onSettingsChanged(deviceInfo?: MediaDeviceInfo) {
    await this.participantcamera.initializePreview(deviceInfo.deviceId);
    if (this.settings.isPreviewing) {
      const track = await this.settings.showPreviewCamera();
      if (this.activeRoom) {
        const localParticipant = this.activeRoom.localParticipant;
        localParticipant.videoTracks.forEach((publication) =>
          publication.unpublish()
        );
        await localParticipant.publishTrack(track);
      }
    }
  }

  async onLeaveRoom() {
    const videoDevice = this.settings.hidePreviewCamera();
    await this.participantcamera.initializePreview(
      videoDevice && videoDevice.deviceId
    );

    this.participants.clear();

    if (this.activeRoom) {
      this.activeRoom.disconnect();
      this.activeRoom = null;
      // this.router.navigate(['/doctor/appointment']);
      window.location.href = '/RelaxNow/doctor/dashboard';
    } else {
      window.location.href = '/RelaxNow/doctor/dashboard';
    }
  }

  async onRoomChanged() {
    //if (this.appointmentDetails.Twilio_ID) {
    if (this.activeRoom) {
      this.activeRoom.disconnect();
    }

    this.participantcamera.finalizePreview();

    const tracks = await Promise.all([
      createLocalAudioTrack(),
      this.settings.showPreviewCamera(),
    ]);
    var __room = localStorage.getItem('call_room');
    this.activeRoom = await this.videoChatService.joinOrCreateRoom(
      __room,
      tracks
    );
    this.romm = __room;

    if (this.participants) {
      this.participants.initialize(this.activeRoom.participants);
    }
    this.registerRoomEvents();
    //}
  }

  onParticipantsChanged(_: boolean) {
    this.videoChatService.nudge();
    this.startTimer();
  }
  startTimer(): void {
    if (this.countDownInterval) {
      clearInterval(this.countDownInterval);
    }
    this.countDownInterval = setInterval(() => {
      const minutes = Math.floor(this.interval / 60);
      const seconds = Math.floor(this.interval % 60);

      this.counter =
        (minutes < 10 ? '0' + minutes : minutes) +
        ':' +
        (seconds < 10 ? '0' + seconds : seconds);
      this.interval++;
    }, 1000);
  }

  private registerRoomEvents() {
    this.activeRoom
      .on('disconnected', (room: Room) =>
        room.localParticipant.tracks.forEach((publication) =>
          this.detachLocalTrack(publication.track)
        )
      )
      .on('participantConnected', (participant: RemoteParticipant) =>
        this.participants.add(participant)
      )
      .on('participantDisconnected', async (participant: RemoteParticipant) => {
        this.participants.remove(participant);
        const videoDevice = this.settings.hidePreviewCamera();
        await this.participantcamera.initializePreview(
          videoDevice && videoDevice.deviceId
        );

        this.participants.clear();

        if (this.activeRoom) {
          this.activeRoom.disconnect();
          this.activeRoom = null;
          // this.router.navigate(['/doctor/appointment']);
          window.location.href = '/RelaxNow/doctor/dashboard';
        } else {
          window.location.href = '/RelaxNow/doctor/dashboard';
        }
      })
      .on('dominantSpeakerChanged', (dominantSpeaker: RemoteParticipant) =>
        this.participants.loudest(dominantSpeaker)
      );
  }

  private detachLocalTrack(track: LocalTrack) {
    if (this.isDetachable(track)) {
      track.detach().forEach((el) => el.remove());
    }
  }

  private isDetachable(
    track: LocalTrack
  ): track is LocalAudioTrack | LocalVideoTrack {
    return (
      !!track &&
      ((track as LocalAudioTrack).detach !== undefined ||
        (track as LocalVideoTrack).detach !== undefined)
    );
  }

  toggleMute(): any {
    if (!this.activeRoom || !this.activeRoom.localParticipant) {
      throw new Error('You must be connected to a room to mute tracks.');
    }

    this.activeRoom.localParticipant.audioTracks.forEach((publication) => {
      if (!this.muteAudio) {
        publication.track.disable();
      } else {
        publication.track.enable();
      }
      this.muteAudio = !this.muteAudio;
    });
  }
  toggleVideo(): any {
    if (!this.activeRoom || !this.activeRoom.localParticipant) {
      throw new Error('You must be connected to a room to mute tracks.');
    }
    this.activeRoom.localParticipant.videoTracks.forEach((publication) => {
      if (!this.hideVideo) {
        publication.track.disable();
      } else {
        publication.track.enable();
      }
      this.hideVideo = !this.hideVideo;
    });
  }

  countTimer(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return (
      ('00' + minutes).slice(-2) +
      ':' +
      ('00' + Math.floor(value - minutes * 60)).slice(-2)
    );
  }

  getAppointmentDetails(): void {
    debugger;
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
          setTimeout(() => {
            this.onRoomChanged();
            this.loader.hide();
          }, 3000);
        }
      },
      (error) => console.log(error)
    );
  }

  InsertMedicationDetails() {
    if (this.prescription == '') {
      if (this.userRole == 'Psychiatrist') {
        this.message.showError('Prescription Note is required.');
      } else {
        this.message.showError('Notes is required.');
      }

      return;
    }

    const params = {
      Appointment_Id: this.appointmentId,
      Notes: this.htmlCharService.HtmlEncode(this.prescription),
      CreatedBy:
        this.appointmentDetails.DOCTOR_FIRST_NAME +
        ' ' +
        this.appointmentDetails.DOCTOR_LAST_NAME,
      notes_type: this.notesType,
      prescriptionId: 0,
      domicile: '',
      Medication: [],
    };
    // if (this.selectedPrescId) {
    // } else {
    this.http.postData(ApiUrl.medication, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (this.userRole == 'Psychiatrist') {
            this.message.showSuccess('Prescription Added Successfully');
          } else {
            this.message.showSuccess('Added Successfully');
          }

          const params2 = {
            Patient_Name: this.appointmentDetails.RN_CUSTOMER_FIRST_NAME,
            Email: this.appointmentDetails.RN_CUSTOMER_EMAIL,
            Template_Name: 'PRESCRIPTION',
            Dr_Name:
              this.appointmentDetails.DOCTOR_Prefix +
              ' ' +
              this.appointmentDetails.DOCTOR_FIRST_NAME +
              '' +
              this.appointmentDetails.DOCTOR_LAST_NAME,
            Date_Time: this.appointmentDetails.APPOINTMENT_DATE,
          };
          this.http.postData(ApiUrl.email, params2).subscribe((resp: any) => {
            if (!!resp) {
            }
          });
          this.prescription = '';
        }
      },
      (error) => {
        console.log(error);
      }
    );
    //  }
  }
  ngOnDestroy() {
    if (this.activeRoom) {
      this.activeRoom.localParticipant.tracks.forEach((publication) =>
        this.detachLocalTrack(publication.track)
      );
      this.activeRoom.disconnect();
      this.activeRoom = null;
      this.participants.clear();
    }
    if (this.countDownInterval) {
      clearInterval(this.countDownInterval);
    }
    location.reload();
  }
}
