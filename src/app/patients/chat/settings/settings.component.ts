import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CameraComponent } from '../camera/camera.component';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/core/services/device/device.service';
import { DeviceSelectComponent } from './device-select.component';

@Component({
  selector: 'app-settings',
  styleUrls: ['./settings.component.css'],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
  private devices: MediaDeviceInfo[] = [];
  private subscription: Subscription;
  private videoDeviceId: string;

  get hasAudioInputOptions(): boolean {
    return (
      this.devices &&
      this.devices.filter((d) => d.kind === 'audioinput').length > 0
    );
  }
  get hasAudioOutputOptions(): boolean {
    return (
      this.devices &&
      this.devices.filter((d) => d.kind === 'audiooutput').length > 0
    );
  }
  get hasVideoInputOptions(): boolean {
    return (
      this.devices &&
      this.devices.filter((d) => d.kind === 'videoinput').length > 0
    );
  }

  @ViewChild('previewcamera') previewcamera: CameraComponent;
  @ViewChild('videoSelect') video: DeviceSelectComponent;

  @Input('isPreviewing') isPreviewing: boolean;
  @Output() settingsChanged = new EventEmitter<MediaDeviceInfo>();

  constructor(private readonly deviceService: DeviceService) {}

  ngOnInit() {
    this.subscription = this.deviceService.$devicesUpdated
      .pipe(debounceTime(350))
      .subscribe(async (deviceListPromise) => {
        this.devices = await deviceListPromise;
        this.handleDeviceAvailabilityChanges();
      });
  }

  async onSettingsChanged(deviceInfo: MediaDeviceInfo) {
    this.settingsChanged.emit(deviceInfo);
  }

  async showPreviewCamera() {
    this.isPreviewing = true;
    if (this.video == undefined) {
      setTimeout(async () => {
        if (!this.previewcamera.videoTrack) {
          this.videoDeviceId = this.video.selectedId;
          const videoDevice = this.devices.find(
            (d) => d.deviceId === this.video.selectedId
          );
          await this.previewcamera.initializePreview(videoDevice.deviceId);
        }

        return this.previewcamera.videoTrack;
      }, 15000);
    } else {
      if (!this.previewcamera.videoTrack) {
        this.videoDeviceId = this.video.selectedId;
        const videoDevice = this.devices.find(
          (d) => d.deviceId === this.video.selectedId
        );
        await this.previewcamera.initializePreview(videoDevice.deviceId);
      }

      return this.previewcamera.videoTrack;
    }
  }

  hidePreviewCamera() {
    this.isPreviewing = false;
    this.previewcamera.finalizePreview();
    if (this.devices.length > 0) {
      return this.devices[0];
    }
  }

  private handleDeviceAvailabilityChanges() {
    if (this.video == undefined) {
      setTimeout(() => {
        if (
          this.devices &&
          this.devices.length &&
          this.video &&
          this.video.selectedId
        ) {
          let videoDevice = this.devices.find(
            (d) => d.deviceId === this.video.selectedId
          );
          if (!videoDevice) {
            videoDevice = this.devices.find((d) => d.kind === 'videoinput');
            if (videoDevice) {
              this.video.selectedId = videoDevice.deviceId;
              this.onSettingsChanged(videoDevice);
            }
          }
        }
      }, 15000);
    } else {
      if (
        this.devices &&
        this.devices.length &&
        this.video &&
        this.video.selectedId
      ) {
        let videoDevice = this.devices.find(
          (d) => d.deviceId === this.video.selectedId
        );
        if (!videoDevice) {
          videoDevice = this.devices.find((d) => d.kind === 'videoinput');
          if (videoDevice) {
            this.video.selectedId = videoDevice.deviceId;
            this.onSettingsChanged(videoDevice);
          }
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
