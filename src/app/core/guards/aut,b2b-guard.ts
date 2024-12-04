import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class B2BGuard implements CanActivate {
  constructor(private router: Router, private user: UserService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    debugger;
    if (this.user.getUserToken && this.user.currentUserRole === 'B2BADMIN') {
      return true;
    }
    this.router.navigate(['/b2b/login']);
    return false;
  }
}
