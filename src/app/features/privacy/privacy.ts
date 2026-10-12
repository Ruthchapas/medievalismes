import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_EMAIL } from '../../core/auth/firebase.config';
import { BackButton } from '../../shared/ui/back-button/back-button';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink, BackButton],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class Privacy {
  protected readonly contact = CONTACT_EMAIL;
}
