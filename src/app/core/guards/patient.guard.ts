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
export class PatientGuard implements CanActivate {
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
    if (this.user.getUserToken && this.user.currentUserRole === 'CUSTOMER') {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
