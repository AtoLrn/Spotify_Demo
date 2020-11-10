import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  skip = (token: string): void => {
    const trimedToken = token.trim()
    if (trimedToken) {
      this.router.navigate(['main'], { queryParams: {['bearer']: token}})
    }
  }

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

}
