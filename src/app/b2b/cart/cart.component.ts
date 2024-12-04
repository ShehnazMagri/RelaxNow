import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  userSubscription: Subscription;
  userId = 0;
  cartDetails = [];
  public totalAmount = 0;
  public corporateCode = '';
  public NO_OF_USERS = 1;
  public currentUserRole = '';
  constructor(
    private message: MessageService,
    private modalService: BsModalService,
    private http: HttpService,
    private user: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.result[0].USERID;
          this.corporateCode = userData.result[0].CORPORATECODE;
          this.currentUserRole = userData.result[0].ROLE;
          this.getOrgCart();
        }
      }
    );
  }
  getOrgCart(): void {
    debugger;
    const params = {
      query: `Call RN_GET_ORG_CART_DETAILS(${this.userId},'${this.corporateCode}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.cartDetails = resp.data[0].result;
          if (resp.data[0].result.length > 0) {
            this.cartDetails = resp.data[0].result;
            this.NO_OF_USERS = this.cartDetails[0].CART_USERS;
            this.sumOfPayment();
            localStorage.setItem(
              'cartProduct',
              this.cartDetails.length.toString()
            );
          } else {
            localStorage.setItem('cartProduct', '0');
          }
          if (this.currentUserRole == 'B2BADMIN') {
            this.router.navigateByUrl('/b2b/cart');
          } else {
            this.router.navigateByUrl('/p/cart');
          }
        }
      },
      (error) => console.log(error)
    );
  }

  keydown(e) {
    if (
      !(
        (e.keyCode > 95 && e.keyCode < 106) ||
        (e.keyCode > 47 && e.keyCode < 58) ||
        e.keyCode === 8
      )
    ) {
      return false;
    }
  }
  sumOfPayment() {
    this.totalAmount = 0;
    this.cartDetails.forEach((item) => {
      this.totalAmount = this.totalAmount + this.NO_OF_USERS * item.ITEM_COST;
    });
    this.totalAmount = Number(this.totalAmount.toFixed(2));
  }

  deleteProductFromCart(item): void {
    this.message.confirm('remove product from cart').then((data) => {
      if (data.value) {
        debugger;
        const params = {
          query: `Call RN_DELETE_ORG_CART_DETAIL(${item.ID})`,
          params: '',
        };
        this.http.postData(ApiUrl.common, params).subscribe(
          (resp: any) => {
            if (!!resp) {
              this.message.showSuccess('Product removed from cart.');

              this.getOrgCart();
            }
          },
          (error) => console.log(error)
        );
      }
    });
  }

  checkOut() {
    debugger;
    if (this.totalAmount <= 0) {
      this.message.showError('Amount should be greater than Zero');
      return;
    }

    var data = {
      cartId: this.cartDetails[0].CARTID,
      amount: Number(this.totalAmount.toFixed(2)),
    };
    localStorage.setItem('b2bCheckOut', JSON.stringify(data));
    if (this.currentUserRole == 'B2BADMIN') {
      this.router.navigateByUrl('/b2b/checkout');
    } else {
      this.router.navigateByUrl('/p/checkout-service');
    }
  }
  UpdateCartDetails() {
    debugger;
    const params = {
      query: `Call RN_UPDATE_CART_NO_OF_USERS(${this.NO_OF_USERS},${this.cartDetails[0].CARTID})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        this.sumOfPayment();
      },
      (error) => console.log(error)
    );
  }
}
