import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { orderBy } from 'lodash';

@Component({
  selector: 'app-search-doctor',
  templateUrl: './search-doctor.component.html',
  styleUrls: ['./search-doctor.component.css'],
})
export class SearchDoctorComponent implements OnInit {
  doctors: any = [];
  roleList: any = ['Psychiatrist', 'Psychologist'];
  selectedRoles: any = [];
  doctorsData = [];
  type;
  specialistType;
  specialist = '';
  stateId = 0;
  cityId = 0;
  states = [];
  cities = [];
  speciality;
  images = [
    {
      path: 'assets/img/features/feature-01.jpg',
    },
    {
      path: 'assets/img/features/feature-02.jpg',
    },
    {
      path: 'assets/img/features/feature-03.jpg',
    },
    {
      path: 'assets/img/features/feature-04.jpg',
    },
  ];
  searchText = '';
  sortBy = '0';
  selDate;
  constructor(private route: ActivatedRoute, private http: HttpService) {
    this.searchText = this.route.snapshot.queryParams['search']
      ? this.route.snapshot.queryParams['search']
      : '';
  }

  ngOnInit(): void {
    this.getDoctorsList();
    this.getState();
  }

  getDoctorsList(): void {
    this.doctorsData = [];
    this.doctors = [];
    const params = { searchtext: this.searchText };
    this.http.postData(ApiUrl.searchPeople, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result = resp.data ? resp.data : [];
          result.map((v) => {
            v['EXP'] = this.getExperience(v.PRACTICING_FROM);
            // if (v.ROLENAME && this.roleList.indexOf(v.ROLENAME) < 0) {
            //   this.roleList.push(v.ROLENAME);
            // }
          });
          this.doctorsData = result;
          this.doctors = result;
          // if (this.searchText) {
          this.filterSearch();
          // }
        }
      },
      (error) => console.log(error)
    );
  }

  checkType(event) {
    if (event.target.checked) {
      this.type = event.target.value;
    } else {
      this.type = '';
    }
  }

  checkSpecialistType(event) {
    if (event.target.checked) {
      this.specialistType = event.target.value;
    } else {
      this.specialistType = '';
    }
    console.log(this.specialistType);
  }
  filterSearch() {
    let gender = 0;
    if (this.type === 'Male') {
      gender = 5;
    }
    if (this.type === 'Female') {
      gender = 6;
    }
    if (gender || this.specialistType) {
      this.doctors = this.doctorsData.filter((v) => {
        // let condition1;
        let condition2;
        let condition3;
        // if (this.searchText) {
        //   const name = v.FIRST_NAME + ' ' + v.MIDDLE_NAME + ' ' + v.LAST_NAME;
        //   condition1 =
        //     name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        //     (v.SPECIALITY &&
        //       this.searchText.toLowerCase() === v.SPECIALITY.toLowerCase()) ||
        //     (v.PROFESSIONAL_TITLE &&
        //       this.searchText.toLowerCase() ===
        //         v.PROFESSIONAL_TITLE.toLowerCase());
        // }
        if (gender) {
          condition2 = v.GENDER_ID && +v.GENDER_ID === +gender;
        }
        if (this.specialistType) {
          condition3 =
            this.specialistType.toLowerCase() === v.ROLENAME.toLowerCase();
        }

        // if (this.searchText && !gender && !this.selectedRoles.length) {
        //   return !!condition1;
        // } else if (!this.searchText && gender && !this.selectedRoles.length) {
        //   return !!condition2;
        // } else if (this.searchText && gender && !this.selectedRoles.length) {
        //   return !!condition1 && !!condition2;
        // } else if (!this.searchText && !gender && this.selectedRoles.length) {
        //   return !!condition3;
        // } else if (this.searchText && !gender && this.selectedRoles.length) {
        //   return !!condition1 && !!condition3;
        // } else if (!this.searchText && gender && this.selectedRoles.length) {
        //   return !!condition2 && !!condition3;
        // } else if (this.searchText && gender && this.selectedRoles.length) {
        //   return !!condition1 && !!condition2 && !!condition3;
        // }
        if (gender && !this.specialistType) {
          return !!condition2;
        } else if (!gender && this.specialistType) {
          return !!condition3;
        } else if (gender && this.specialistType) {
          return !!condition2 && !!condition3;
        }
      });
    } else {
      this.doctors = this.doctorsData;
    }
    if(this.stateId!=0)
    {
      this.doctors = this.doctors.filter(x=>x.STATE_ID==this.stateId);
    }
    if(this.cityId!=0)
    {
      this.doctors = this.doctors.filter(x=>x.CITY_ID==this.cityId);
    }
  }
  clearFilter(): void {
    this.selectedRoles = [];
    this.type = '';
    this.specialistType = '';
    this.searchText = '';
    this.cityId=0;
    this.stateId=0;
    this.cities=[];
    this.getDoctorsList();
  }
  checkSpeciality(event, val) {
    const rIndex = this.selectedRoles.indexOf(val);
    if (event.target.checked) {
      if (rIndex < 0) {
        this.selectedRoles.push(val);
      }
    } else {
      this.selectedRoles.slice(rIndex, 1);
    }
  }

  /*** SOrt Doctor Array ***/
  sortDoctors() {
    switch (this.sortBy.toString()) {
      case '1':
        this.doctors = orderBy(this.doctors, ['EXP'], ['desc']);
        break;
      case '2':
        this.doctors = orderBy(
          this.doctors,
          ['FIRST_CONSULTATION_FEE'],
          ['asc']
        );

        break;
      case '3':
        this.doctors = orderBy(
          this.doctors,
          ['FIRST_CONSULTATION_FEE'],
          ['desc']
        );
        break;
      default:
        this.doctors = orderBy(this.doctors, ['EXP'], ['desc']);
        break;
    }
  }

  /*** Group Data By property ***/
  groupBy(objectArray, property): void {
    this.doctorsData = [];
    objectArray.reduce((acc, obj) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      // Add object to list for given key's value
      acc[key].push(obj);
      if (this.doctorsData.filter((x) => x.id == key).length > 0) {
        //
        this.doctorsData.filter((x) => x.id == key)[0].items.push(obj);
      } else {
        this.doctorsData.push({
          id: obj.PEOPLEID,
          ACTIVE: obj.ACTIVE,
          ADDRESS: obj.ADDRESS,
          FIRST_CONSULTATION_FEE: obj.FIRST_CONSULTATION_FEE,
          FIRST_NAME: obj.FIRST_NAME,
          MIDDLE_NAME: obj.MIDDLE_NAME,
          LAST_NAME: obj.LAST_NAME,
          FOLLOWUP_CONSULTATION_FEE: obj.FOLLOWUP_CONSULTATION_FEE,
          GENDER_ID: obj.GENDER_ID,
          Mobile: obj.Mobile,
          PEOPLEID: obj.PEOPLEID,
          PRACTICING_FROM: obj.PRACTICING_FROM,
          PROFESSIONAL_STATEMENT: obj.PROFESSIONAL_STATEMENT,
          PROFESSIONAL_TITLE: obj.PROFESSIONAL_TITLE,
          Prefix: obj.Prefix,
          SPECIALITY: obj.SPECIALITY,
          UID_NUMBER: obj.UID_NUMBER,
          EXP: this.getExperience(obj.PRACTICING_FROM),
          items: [obj],
        });
      }
      this.doctorsData.sort((a, b) => {
        return a.id - b.id;
      });
      return acc;
    }, {});
  }

  /*** Get Years Diffrence from current date ***/
  getExperience(startDate): number {
    if (moment(startDate, 'YYYY-MM-DD').isValid()) {
      return moment().diff(moment(startDate, 'YYYY-MM-DD'), 'years');
    }
    return 0;
  }
  bookAppointment(id) {}

  /*** Get Groups Listing ***/
  getState(): void {
    const params = {
      query: null
    };
    this.http.postData('/api/get-states', params).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          const result =resp.data[0];
          this.states = result;
        }
      },
      (error) => console.log(error)
    );
  }

  getCity(cityId): void {
    debugger;
    const params = {
      id: cityId,
    };
    this.http.postData('/api/get-cities', params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =resp.data[0];
          this.cities = result;
        }
      },
      (error) => console.log(error)
    );
  }
}
