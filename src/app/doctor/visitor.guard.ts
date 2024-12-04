import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../core/services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class VisitorGuard implements CanActivate {
  constructor(private router: Router, private user: UserService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (
      this.user.getUserToken &&
      !!this.user.currentUserValue.result[0].IS_VISITOR
    ) {
      return true;
    }
    this.router.navigate(['/doctor/dashboard']);
    return false;
  }
}
