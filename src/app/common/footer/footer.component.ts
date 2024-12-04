import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  public showAssesment = true;
  isSafari=false;
  constructor(private user: UserService,
    private deviceDetect: DeviceDetectorService) {}
currentYear=new Date().getFullYear();
  ngOnInit(): void {
   var bname= this.detectBrowserName();
   debugger;
   var device = this.deviceDetect.getDeviceInfo();
   if(device.browser=="Safari" ||device.browser=="safari" )
   {
    this.isSafari=true;
   }
    this.user.currentUserSubject.subscribe((userData) => {
      if (userData) {
        if (
          userData.result[0].CORPORATECODE != null &&
          userData.result[0].CORPORATECODE != ''
        ) {
          this.showAssesment = false;
        }
      }
    });
  }

  detectBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase()
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(<any>window).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
        // $('#video_call').modal({
        //   show: true,
        //   backdrop: 'static',
        //   keyboard: false,
        // });
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        this.isSafari=true;
        return 'safari';
      default:
        return 'other';
    }
  }
}
