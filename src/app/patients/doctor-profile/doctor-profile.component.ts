import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { HtmlCharService } from 'src/app/htmchar-service.service';
@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
})
export class DoctorProfileComponent implements OnInit {
  isSubmitted = false;
  docId;
  userImage = '';
  doctorDetails;
  userSubscription: Subscription;
  userData;
  islogin = false;
  roleList: any = ['Psychiatrist', 'Psychologist'];
  reviews = [];
  allReviews = [];
  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private user: UserService,
    private message: MessageService,
    private htmlCharService: HtmlCharService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe((auth) => {
      if (auth && auth.token) {
        this.islogin = !!auth.token;
        this.userData = auth.result[0];
      }
    });

    window.scrollTo(0, 0);
    this.docId = this.route.snapshot.paramMap.get('docId');
    if (this.docId) {
      this.getDoctorProfile();
    }
  }

  /*** Get User Profile ***/
  getDoctorProfile(): void {
    this.http
      .postData(ApiUrl.getPeopleInfo, { peopleId: this.docId })
      .subscribe(
        (resp: any) => {
          if (!!resp && resp.data) {
            const result = resp.data;
            result.Qualification.map((e) => {
              e.PRECUREMENT_YEAR = e.PRECUREMENT_YEAR
                ? JSON.parse(e.PRECUREMENT_YEAR)
                : null;
            });

            result.HOSPITAL_AFFILIATION.map((e) => {
              e.START_TIME = e.START_TIME ? JSON.parse(e.START_TIME) : null;
              e.END_TIME = e.END_TIME ? JSON.parse(e.END_TIME) : null;
            });
            this.allReviews = result.PEOPLE_REVIEW;
            this.reviews =
              this.allReviews.length > 2
                ? this.allReviews.slice(0, 2)
                : this.allReviews;
            result['EXP'] = this.getExperience(
              result.PEOPLE_PROFILE[0].PRACTICING_FROM
            );
            this.doctorDetails = result;
            this.doctorDetails.PEOPLE_PROFILE[0].PROFESSIONAL_STATEMENT =
              this.htmlCharService.decodeHtmlCharCodes(
                this.doctorDetails?.PEOPLE_PROFILE[0]?.PROFESSIONAL_STATEMENT
              );
          }
        },
        (error) => console.log(error)
      );
  }
  showAllReviews(show: boolean): void {
    if (show) {
      this.reviews = this.allReviews;
    } else {
      this.reviews = this.allReviews.slice(0, 2);
    }
  }

  /*** Get Years Diffrence from current date ***/
  getExperience(startDate): number {
    if (moment(startDate, 'YYYY-MM-DD').isValid()) {
      return moment().diff(moment(startDate, 'YYYY-MM-DD'), 'years');
    }
    return 0;
  }
}
