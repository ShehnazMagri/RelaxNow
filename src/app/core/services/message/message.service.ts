import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import swal, { SweetAlertResult } from 'sweetalert2';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  isMobile = false;
  constructor(
    private deviceDetect: DeviceDetectorService,
    private toastr: ToastrService
  ) {
    this.isMobile = this.deviceDetect.isMobile();
  }

  showSuccess(title: string) {
    if (!this.isMobile) {
      this.toastr.success(title);
    } else {
      swal.fire({
        icon: 'success',
        title,
        confirmButtonText: 'Ok',
        allowOutsideClick: false,
        backdrop: false
      });
    }
  }

  showSuccessForMessage(title: string) {
    if (!this.isMobile) {
      this.toastr.success(title,'New Message');
    } else {
      swal.fire({
        icon: 'success',
        title,
        confirmButtonText: 'Ok',
        allowOutsideClick: false,
        backdrop: false
      });
    }
  }

  showError(title: string) {
    if (!this.isMobile) {
      this.toastr.error(title);
    } else {
      swal.fire({
        icon: 'error',
        title,
        confirmButtonText: 'Ok',
        allowOutsideClick: false,
        backdrop: true
      });
    }
  }

  /******************* confirmation dialog box (returns a promise) ********************/
  async confirm(title: string, text?: string): Promise<SweetAlertResult> {
    const result: SweetAlertResult = await swal.fire({
      title: `Do you want to ${title}?`,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      animation: false,
      allowOutsideClick: false,
    });
    return result;
  }

  async confirmAppointment(
    title: string,
    text?: string
  ): Promise<SweetAlertResult> {
    const result: SweetAlertResult = await swal.fire({
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      animation: false,
      allowOutsideClick: false,
      html: `<div style="text-align:left">
      <h5>Do you want to ${title}?</h5>
     <b> Amount: ${text}</b><br/>
      <input id="swal-input1" placeholder="Please add notes.." class="swal2-input">
      </div>
      `,
      preConfirm: function () {
        return new Promise(function (resolve) {
          // Validate input
          if ($('#swal-input1').val() == '') {
            swal.showValidationMessage('Enter a value in the field'); // Show error when validation fails.
            swal.enableButtons();
          } else {
            swal.resetValidationMessage(); // Reset the validation message.
            resolve($('#swal-input1').val());
            swal.enableButtons();
          }
        });
      },
      onOpen: function () {
        $('#swal-input1').focus();
      },
    });
    return result;
  }

  async confirmAssesmentText(
    title: string,
    text?: string
  ): Promise<SweetAlertResult> {
    const result: SweetAlertResult = await swal.fire({
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Copy',
      cancelButtonText: 'No',
      animation: false,
      width: 700,
      allowOutsideClick: false,
      html: `<div style="text-align:left">
      <h5>The Assignment created successfully and details shared over email.</h5></br>
     <b> URL: ${title}</b><br/>
      <b>Code: ${text}</b>
      </div>
      `,
    });
    return result;
  }

  async GeneriicAppointment(
    title: string,
    text?: string
  ): Promise<SweetAlertResult> {
    const result: SweetAlertResult = await swal.fire({
      title: `${title}`,
      text,
      icon: 'success',
      width: 700,
      showCancelButton: true,
      confirmButtonText: 'Copy',
      cancelButtonText: 'Close',
      animation: false,
      allowOutsideClick: false,
    });
    return result;
  }

  async defaultUsernamePassword(
    title: string,
    text?: string
  ): Promise<SweetAlertResult> {
    const result: SweetAlertResult = await swal.fire({
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Close',
      animation: false,
      width: 400,
      allowOutsideClick: false,
      html: `<div style="text-align:left">
      <h5>User is created successfully and details are below.</h5></br>
     <h6> Username: ${title}</h6><br/>
      <h6>Password: ${text}</h6>
      </div>
      `,
    });
    return result;
  }
}
