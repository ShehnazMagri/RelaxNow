import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { CommonServiceService } from '../common-service.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { ApiUrl } from '../core/apiUrl';
import { HttpService } from '../core/services/http/http.service';
declare const $: any;

export interface Doctors {
  id: number;
  doctor_name: string;
  speciality: string;
  Education: string;
  location: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  // encapsulation : ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  @ViewChild('slickModal1') slickModal1: SlickCarouselComponent;
  @ViewChild('slickModal2') slickModal2: SlickCarouselComponent;
  @ViewChild('slickModal3') slickModal3: SlickCarouselComponent;
  specialityList: any = [];
  doctors: any = [];
  slidepage: any;
  employeeCtrl = new FormControl();
  filteredEmployee: Observable<Doctors[]>;
  blogs: any = [];
  keyword = 'name';
  searchDoctor = '';
  public countries = [
    {
      id: 1,
      name: 'Albania',
      img: 'image',
    },
    {
      id: 2,
      name: 'Belgium',
    },
    {
      id: 3,
      name: 'Denmark',
    },
    {
      id: 4,
      name: 'Montenegro',
    },
    {
      id: 5,
      name: 'Turkey',
    },
    {
      id: 6,
      name: 'Ukraine',
    },
    {
      id: 7,
      name: 'Macedonia',
    },
    {
      id: 8,
      name: 'Slovenia',
    },
    {
      id: 9,
      name: 'Georgia',
    },
    {
      id: 10,
      name: 'India',
    },
    {
      id: 11,
      name: 'Russia',
    },
    {
      id: 12,
      name: 'Switzerland',
    },
  ];

  slides = [
    {
      img: 'assets/img/specialities/stress.png',
      msg: 'Learn to cope with your everyday tasks and enhance your productivity',
      name: 'STRESS',
    },
    {
      img: 'assets/img/specialities/Anxiety.png',
      msg: 'Fight through those suffocating feelings and make a positive change',
      name: 'ANXIETY',
    },
    {
      img: 'assets/img/specialities/smoke.png',
      msg: 'Fight with addiction substances, physiological dependence & drug-seeking',
      name: 'ADDICTION',
    },
    {
      img: 'assets/img/specialities/sleep.png',
      msg: 'Tackle difficulties in falling and/or staying asleep',
      name: 'INSOMNIA',
    },
    {
      img: 'assets/img/specialities/Depress.png',
      msg: 'Fight through those suffocating feelings and make a positive change',
      name: 'DEPRESSION',
    },
    //  {
    //   img: 'assets/img/specialities/stress.png',
    //   msg: 'Learn to cope with your everyday tasks and enhance your productivity',
    //   name: 'STRESS',
    // },
    // {
    //   img: 'assets/img/specialities/Anxiety.png',
    //   msg: 'Fight through those suffocating feelings and make a positive change',
    //   name: 'ANXITY',
    // },
  ];
  slideConfig = {
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  slideConfig2 = {
    dots: true,
    infinite: true,
    centerMode: true,
    slidesToShow: 3,
    speed: 500,
    variableWidth: true,
    arrows: false,
    autoplay: false,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  slideConfig3 = {
    dots: true,
    arrows: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  constructor(
    public router: Router,
    public commonService: CommonServiceService,
    private http: HttpService
  ) {
    this.filteredEmployee = this.employeeCtrl.valueChanges.pipe(
      startWith(''),
      map((employee) =>
        employee ? this._filterEmployees(employee) : this.doctors.slice()
      )
    );
  }

  ngOnInit() {

    window.scrollTo(0, 0);
    // this.getspeciality();
    this.getDoctors();
    // this.getblogs();

    // User's voice slider
    $('.testi-slider').each(function () {
      var $show = $(this).data('show');
      var $arr = $(this).data('arrow');
      var $dots = !$arr;
      var $m_show = $show;
      if ($show == 3) $m_show = $show - 1;
      $(this).slick({
        slidesToShow: $show,
        slidesToScroll: 1,
        arrows: $arr,
        autoplay: false,
        autoplaySpeed: 6000,
        adaptiveHeight: true,
        prevArrow:
          '<button type="button" class="prev-nav"><i class="icon ion-ios-arrow-back"></i></button>',
        nextArrow:
          '<button type="button" class="next-nav"><i class="icon ion-ios-arrow-forward"></i></button>',
        responsive: [
          {
            breakpoint: 991,
            settings: {
              slidesToShow: $m_show,
              slidesToScroll: 1,
              infinite: true,
              arrows: $arr,
              dots: $dots,
            },
          },
          {
            breakpoint: 767,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              arrows: false,
              dots: true,
            },
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              arrows: false,
              dots: true,
            },
          },
        ],
      });
    });
  }
  private _filterEmployees(value: string): Doctors[] {
    const filterValue = value.toLowerCase();
    return this.doctors.filter(
      (state) => state.name.toLowerCase().indexOf(filterValue) === 0
    );
  }

  next() {
    this.slickModal1.slickNext();
  }

  prev() {
    this.slickModal1.slickPrev();
  }

  getspeciality() {
    this.commonService.getSpeciality().subscribe((res) => {
      this.specialityList = res;
    });
  }

  getDoctors() {
    this.doctors = [];
    this.http.postData(ApiUrl.searchPeople, { searchtext: 'Psych' }).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result = resp.data ? resp.data : [];
          result.forEach((element) => {
            this.doctors.push({
              id: element.DOCTOR_ID.toString(),
              name: element.FIRST_NAME,
              //  +
              // ' ' +
              // element.MIDDLE_NAME +
              // ' ' +
              // element.LAST_NAME,
            });
          });
        }
      },
      (error) => console.log(error)
    );
  }

  getblogs() {
    this.commonService.getBlogs().subscribe((res) => {
      this.blogs = res;
    });
  }

  selectEvent(item) {
    // let filter = this.countries.filter((a) => a.name === item.name);
    this.searchDoctor = item.name;
    this.router.navigate(['/p/search-doctor'], {
      queryParams: { search: item.name },
    });
    // do something with selected item
  }

  onChangeSearch(search: string) {
    this.searchDoctor = search;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocused(e) {
    // do something
  }

  //// next step 2
  sliderContent = [
    {
      img: 'assets/img/features/feature-05.jpg',
      msg: '"Lorem Ipsum is simply dummy text of the printing and typesetting industry."',
      name: 'Psychiatric Consultation',
      position: 'CEO of VoidCoders',
    },
    {
      img: 'assets/img/features/yoga.png',
      msg: '"Lorem Ipsum is simply dummy text of the printing and typesetting industry."',
      name: 'Mental Health Counseling/Therapy',
      position: 'CEO of VoidCoders',
    },
    {
      img: 'assets/img/features/self.jpg',
      msg: '"Lorem Ipsum is simply dummy text of the printing and typesetting industry."',
      name: ' EWI Adult/ Student',
      position: 'CEO of VoidCoders',
    },

    {
      img: 'assets/img/features/mental-health.jpg',
      msg: '"Lorem Ipsum is simply dummy text of the printing and typesetting industry."',
      name: 'GV Happiness Scale',
      position: 'CEO of VoidCoders',
    },
    {
      img: 'assets/img/features/feature-05.jpg',
      msg: '"Lorem Ipsum is simply dummy text of the printing and typesetting industry."',
      name: 'Psychological Assessment',
      position: 'CEO of VoidCoders',
    },
    {
      img: 'assets/img/features/feature-04.jpg',
      msg: '"Lorem Ipsum is simply dummy text of the printing and typesetting industry."',
      name: 'Laboratory Services',
      position: 'CEO of VoidCoders',
    },
    {
      img: 'assets/img/features/feature-06.jpg',
      msg: '"Lorem Ipsum is simply dummy text of the printing and typesetting industry."',
      name: 'Pharmacy',
      position: 'CEO of VoidCoders',
    },

  ];
  slideConfigure = {
    dots: false,
    autoplay: false,
    infinite: true,
    variableWidth: true,
  };
  nextslide() {
    this.slickModal2.slickNext();
  }

  prevslide() {
    this.slickModal2.slickPrev();
  }

  nextpage() {
    this.slickModal3.slickNext();
  }

  prevpage() {
    this.slickModal3.slickPrev();
  }

  searchForDoctor(): void {
    this.router.navigate(['/p/search-doctor'], {
      queryParams: { search: this.searchDoctor },
    });
  }


}
