import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements OnInit, OnDestroy {
  reviews = [];
  userSubscription: Subscription;
  peopleId = 0;
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private http: HttpService, private user: UserService) {}

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.peopleId = userData.result[0].USERID;
          this.getReviews();
        }
      }
    );
  }

  /*** Get Reviews ***/
  getReviews(): void {
    const params = {
      query: `Call RN_PEOPLE_REVIEW_GET(0,${this.peopleId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params, false).subscribe(
      (resp: any) => {
        if (!!resp && resp.data[0]) {
          this.reviews = resp.data[0].result ? resp.data[0].result : [];
          this.dtTrigger.next();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** UnSubscribe the events to prevent memory leakage ***/
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
