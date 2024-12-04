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
export class DoctorGuard implements CanActivate {
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
      (this.user.currentUserRole === 'Psychiatrist' ||
        this.user.currentUserRole === 'Psychologist' ||
        this.user.isSuperAdmin == true)
    ) {
      return true;
    }
    this.router.navigate(['/doctor/login']);
    return false;
  }
}
