import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { HtmlCharService } from 'src/app/htmchar-service.service';
import {
  BasicInfoModel,
  ContactInfoModel,
  EducationModel,
  ExperienceModel,
} from './profile.model';

const now = new Date();
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  profileFilled = false;
  contactInfo: ContactInfoModel = new ContactInfoModel();
  priceType = '';
  price = '';
  educationFields: Array<EducationModel> = [new EducationModel()];
  experienceFields: Array<ExperienceModel> = [new ExperienceModel()];
  peopleId;
  userImage = '';
  profileDetails = new BasicInfoModel();
  userDetails;
  files: File[] = [];
  practiceDate: NgbDateStruct = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  maxDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  dateOfStart: NgbDateStruct[] = [
    {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    },
  ];
  dateOfCompletion: NgbDateStruct[] = [
    {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    },
  ];
  isSubmitted = false;
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';
  specialization = [];
  timeout: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    private message: MessageService,
    private htmlCharService: HtmlCharService
  ) {}

  ngOnInit(): void {
    this.peopleId = this.route.snapshot.paramMap.get('peopleId');
    if (this.peopleId) {
      Promise.all([
        this.getUserProfile(),
        this.getUserImage(),
        this.getUserQualification(),
        this.getUserExperience(),
        this.getUserDetails(),
      ]);
    }
  }

  /*** Get User Profile ***/
  getUserProfile(loader: boolean = true): void {
    const params = {
      query: `Call RN_PEOPLE_PROFILE_GET(${this.peopleId})`,
      params: '',
    };
    this.executeRequest(params, 'profile', loader);
  }

  /*** Get User Image ***/
  getUserImage(): void {
    const params = {
      query: `Call RN_PROFILE_IMAGES_GET(${this.peopleId},1)`,
      params: '',
    };
    this.executeRequest(params, 'userimage');
  }

  /*** Get User Qualification ***/
  getUserQualification(loader: boolean = true): void {
    const params = {
      query: `Call RN_PEOPLE_QUALIFICATION_GET(${this.peopleId})`,
      params: '',
    };
    this.executeRequest(params, 'qualification', loader);
  }

  /*** Get User Experience ***/
  getUserExperience(loader: boolean = true): void {
    const params = {
      query: `Call RN_PEOPLE_HOSPITAL_AFFILIATION_GET(${this.peopleId})`,
      params: '',
    };
    this.executeRequest(params, 'experience', loader);
  }

  /*** Get User Details ***/
  getUserDetails(loader: boolean = true): void {
    const params = {
      query: `Call RN_PEOPLE_GET_BYID(${this.peopleId})`,
      params: '',
    };
    this.executeRequest(params, 'details', loader);
  }

  /***  Save User Profile ***/
  saveProfile(): void {
    this.isSubmitted = true;
    setTimeout(() => {
      this.isSubmitted = false;
    }, 10000);
    this.message.showSuccess('Changes saved successfully!');
    this.router.navigate(['/admin/on-boarding']);
  }

  /***  Save Basic User Info ***/
  saveBasicInfo(val: any, isDate = false): void {
    if (!val || (isDate && !val.year)) {
      return;
    }

    const date = new Date();
    const specialization = [];
    this.specialization.forEach((element) => {
      specialization.push(element.value);
    });

    const currentDate =
      (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
      '/' +
      (date.getMonth() > 8
        ? date.getMonth() + 1
        : '0' + (date.getMonth() + 1)) +
      '/' +
      date.getFullYear();
    const PRACTICING_FROM =
      this.practiceDate['year'] +
      '-' +
      (this.practiceDate['month'] < 10
        ? '0' + this.practiceDate['month']
        : this.practiceDate['month']) +
      '-' +
      (this.practiceDate['day'] < 10
        ? '0' + this.practiceDate['day']
        : this.practiceDate['day']);
    const paramP1 = {
      query: `Call RN_PEOPLE_PROFILE_INSERT(${this.peopleId},'${
        this.profileDetails.PROFESSIONAL_TITLE
      }','${this.htmlCharService.HtmlEncode(
        this.profileDetails.PROFESSIONAL_STATEMENT
      )}','${PRACTICING_FROM}','${this.profileDetails.FIRST_CONSULTATION_FEE}',
      '${this.profileDetails.FOLLOWUP_CONSULTATION_FEE}','${
        this.profileDetails.RESET_DAYS
      }',
      '${this.modifiedBy}','${currentDate}','${
        this.modifiedBy
      }','${currentDate}','1','${specialization.join(',')}')`,
      params: '',
    };

    const paramP2 = {
      query: `Call RN_PEOPLE_PROFILE_UPDATE(${this.peopleId},'${
        this.profileDetails.PROFESSIONAL_TITLE
      }','${this.htmlCharService.HtmlEncode(
        this.profileDetails.PROFESSIONAL_STATEMENT
      )}','${PRACTICING_FROM}','${
        this.profileDetails.FIRST_CONSULTATION_FEE
      }','${this.profileDetails.FOLLOWUP_CONSULTATION_FEE}','${
        this.profileDetails.RESET_DAYS
      }','${this.modifiedBy}','${currentDate}','1','${specialization.join(
        ','
      )}')`,
      params: '',
    };
    if (this.profileFilled) {
      this.executeRequest(paramP2, 'profileUpdate', false);
    } else {
      this.executeRequest(paramP1, 'profileUpdate', false);
    }
  }

  /***  Save User Education/Certification ***/
  saveEducation(index: number): void {
    const education = this.educationFields[index];
    if (
      education.QUALIFICATION &&
      education.INSTITUTE &&
      this.dateOfStart[index] &&
      this.dateOfCompletion[index] &&
      this.dateOfStart[index]['year'] &&
      this.dateOfCompletion[index]['year']
    ) {
      const PRECUREMENT_YEAR = {
        start: this.dateOfStart[index],
        end: this.dateOfCompletion[index],
      };
      const paramE1 = {
        query: `Call RN_PEOPLE_QUALIFICATION_INSERT(${this.peopleId},'${
          education.QUALIFICATION
        }','${education.INSTITUTE}','${JSON.stringify(PRECUREMENT_YEAR)}','${
          this.modifiedBy
        }')`,
        params: '',
      };
      const paramE2 = {
        query: `Call RN_PEOPLE_QUALIFICATION_UPDATE('${education.ID}',${
          this.peopleId
        },'${education.QUALIFICATION}','${
          education.INSTITUTE
        }','${JSON.stringify(PRECUREMENT_YEAR)}','${this.modifiedBy}','1')`,
        params: '',
      };

      if (education.ID) {
        this.executeRequest(paramE2, 'qualificationUpdate', false);
      } else {
        this.executeRequest(paramE1, 'qualificationUpdate', false);
      }
    }
  }
  onDateSelection(date: NgbDate, i, type) {
    if (type === 'exp') {
      if (
        this.experienceFields[i].START_TIME &&
        this.experienceFields[i].END_TIME
      ) {
        if (date.after(this.experienceFields[i].START_TIME)) {
          this.experienceFields[i].END_TIME = date;
        } else {
          this.experienceFields[i].END_TIME = null;
          this.experienceFields[i].START_TIME = date;
        }
        this.saveExperience(i);
      }
    } else {
      if (this.dateOfStart[i] && this.dateOfCompletion[i]) {
        if (date.after(this.dateOfStart[i])) {
          this.dateOfCompletion[i] = date;
        } else {
          this.dateOfCompletion[i] = null;
          this.dateOfStart[i] = date;
        }
        this.saveEducation(i);
      }
    }
  }

  /***  Save User Education/Certification ***/
  saveExperience(index: number): void {
    const experience = this.experienceFields[index];

    if (
      experience.HOSPITAL_NAME &&
      experience.HOSPITAL_ADDRESS &&
      experience.START_TIME['year'] &&
      experience.END_TIME['year']
    ) {
      const paramH1 = {
        query: `Call RN_PEOPLE_HOSPITAL_AFFILIATION_INSERT(${this.peopleId},'${
          experience.HOSPITAL_NAME
        }','${experience.HOSPITAL_ADDRESS}','${JSON.stringify(
          experience.START_TIME
        )}','${JSON.stringify(experience.END_TIME)}','${this.modifiedBy}')`,
        params: '',
      };
      const paramH2 = {
        query: `Call RN_PEOPLE_HOSPITAL_AFFILIATION_UPDATE('${experience.ID}',${
          this.peopleId
        },'${experience.HOSPITAL_NAME}','${
          experience.HOSPITAL_ADDRESS
        }','${JSON.stringify(experience.START_TIME)}','${JSON.stringify(
          experience.END_TIME
        )}','${this.modifiedBy}','1')`,
        params: '',
      };
      if (this.timeout) {
        window.clearTimeout(this.timeout);
      }
      const timeLimit = (5 - index) * 1000;
      this.timeout = window.setTimeout(() => {
        if (experience.ID) {
          this.executeRequest(paramH2, 'experienceUpdate', false);
        } else {
          this.executeRequest(paramH1, 'experienceUpdate', false);
        }
      }, timeLimit);
    }
  }

  /*** Execute Procedular query  ***/
  executeRequest(params: any, type: string = '', loader: boolean = true): void {
    this.http.postData(ApiUrl.common, params, loader).subscribe(
      (resp: any) => {
        if (!!resp && resp.data[0]) {
          this.handleResponse(resp, type);
        }
      },
      (error) => console.log(error)
    );
  }

  handleResponse(resp: any, type: string): void {
    switch (type) {
      case 'userimage':
        this.userImage =
          resp.data[0].result && resp.data[0].result[0]
            ? resp.data[0].result[0].BASE64CONTENT
            : '';
        break;
      case 'profile':
        const result = resp.data[0].result[0] || '';
        this.profileFilled = !!result;

        if (!!result) {
          this.profileDetails = result;
          this.profileDetails.PROFESSIONAL_STATEMENT =
            this.htmlCharService.decodeHtmlCharCodes(
              this.profileDetails.PROFESSIONAL_STATEMENT
            );
          const practiceStart = this.profileDetails.PRACTICING_FROM
            ? this.profileDetails.PRACTICING_FROM.split('-')
            : [now.getFullYear(), now.getMonth() + 1, now.getDate()];
          this.practiceDate = {
            year: +practiceStart[0],
            month: +practiceStart[1],
            day: +practiceStart[2],
          };
          const spl = result.SPECIALITY ? result.SPECIALITY.split(',') : [];
          this.specialization = [];
          spl.forEach((element) => {
            if (element) {
              this.specialization.push({
                value: element,
                display: element,
              });
            }
          });
        }
        break;
      case 'qualification':
        const result1 = resp.data[0].result || [];
        if (!!result1) {
          this.educationFields = result1.length
            ? result1
            : [new EducationModel()];
          this.educationFields.forEach((v, i) => {
            const eduDates = v.PRECUREMENT_YEAR
              ? JSON.parse(v.PRECUREMENT_YEAR)
              : {
                  start: {
                    year: now.getFullYear(),
                    month: now.getMonth() + 1,
                    day: now.getDate(),
                  },
                  end: {
                    year: now.getFullYear(),
                    month: now.getMonth() + 1,
                    day: now.getDate(),
                  },
                };
            this.dateOfStart[i] = eduDates.start;
            this.dateOfCompletion[i] = eduDates.end;
          });
        }
        break;
      case 'experience':
        const result2 = resp.data[0].result || [];
        if (!!result2) {
          this.experienceFields = result2.length
            ? result2
            : [new ExperienceModel()];
          this.experienceFields.map((exp) => {
            exp.START_TIME = exp.START_TIME
              ? JSON.parse(exp.START_TIME)
              : {
                  start: {
                    year: now.getFullYear(),
                    month: now.getMonth() + 1,
                    day: now.getDate(),
                  },
                };
            exp.END_TIME = exp.END_TIME
              ? JSON.parse(exp.END_TIME)
              : {
                  start: {
                    year: now.getFullYear(),
                    month: now.getMonth() + 1,
                    day: now.getDate(),
                  },
                };
          });
        }
        break;
      case 'details':
        const result3 = resp.data[0].result[0] || '';
        if (!!result3) {
          this.userDetails = result3;
        }
        break;
      case 'profileUpdate':
        this.getUserProfile(false);
        break;
      case 'qualificationUpdate':
        this.getUserQualification(false);
        break;
      case 'experienceUpdate':
        this.getUserExperience(false);
        break;
    }
  }

  /*** Add Education ***/
  addEducationBlock(): void {
    this.educationFields.push(new EducationModel());
  }

  /*** Remove Education ***/
  removeEducationBlock(i: number): void {
    const params = {
      query: `Call RN_PEOPLE_QUALIFICATION_DELETE(${this.educationFields[i].ID})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.educationFields.splice(i, 1);
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Add Experience ***/
  addExperienceBlock(): void {
    this.experienceFields.push(new ExperienceModel());
  }

  /*** Remove Experience ***/
  removeExperienceBlock(i: number): void {
    const params = {
      query: `Call RN_PEOPLE_HOSPITAL_AFFILIATION_DELETE(${this.experienceFields[i].ID})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.experienceFields.splice(i, 1);
        }
      },
      (error) => console.log(error)
    );
  }

  /*** On Image Change ***/
  onSelect(event): void {
    this.files.push(...event.addedFiles);
  }

  /*** Remove Image ***/
  onRemove(event): void {
    this.files.splice(this.files.indexOf(event), 1);
  }

  /********** On selection of image insert the value in form **********/
  onImageSelect(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const parts = file.name.split('.');
      if (file.size / 1024 / 1024 < 5) {
        if (['jpg', 'jpeg', 'png'].includes(parts[parts.length - 1])) {
          const reader: FileReader = new FileReader();
          reader.readAsDataURL(event.target.files[0]);
          reader.onload = (e: any) => {
            this.userImage = e.target.result;
            this.uploadImage();
          };
        } else {
          this.message.showError('Invalid File Type');
        }
      } else {
        this.message.showError('Image Size Should Be Less Than 5 Mb');
      }
    }
  }

  /*** Upload Image ***/
  uploadImage(): void {
    const x = Math.floor(Math.random() * 10000 + 1);
    const params = {
      query: `Call RN_PROFILE_IMAGES_UPSERT(${this.peopleId},1,'${this.userImage}','doc_imag${x}','${this.modifiedBy}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          console.log(resp);
        }
      },
      (error) => console.log(error)
    );
  }
}
