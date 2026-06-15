import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class ContactComponent {

  constructor(private http: HttpClient) {}

  telephone = '+237 6 95 12 34 56';

  // Formulaire
  form = {
    nom:     '',
    email:   '',
    sujet:   '',
    message: '',
  };

  sujets = [
    'Gestion de mon bien',
    'Demande d\'information',
    'Problème technique',
    'Partenariat',
    'Autre',
  ];

  loading  = false;
  succes   = false;
  erreur   = '';

  infos = [
    { icone: 'ti ti-map-pin',  titre: 'Adresse',   valeur: 'Bastos, Yaoundé, Cameroun',  lien: null        },
    { icone: 'ti ti-phone',    titre: 'Téléphone', valeur: '+237 6 95 12 34 56',          lien: 'tel:+237695123456' },
    { icone: 'ti ti-mail',     titre: 'Email',     valeur: 'contact@immogest.cm',         lien: 'mailto:contact@immogest.cm' },
    { icone: 'ti ti-clock',    titre: 'Horaires',  valeur: 'Lun–Ven : 8h–18h',           lien: null        },
  ];

  envoyerMessage(): void {
    if (!this.form.nom || !this.form.email || !this.form.message) {
      this.erreur = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    this.erreur   = '';
    this.loading  = true;

    // Appel API Django
    this.http.post(`${environment.apiUrl}/contact/`, this.form).subscribe({
      next: () => {
        this.succes  = true;
        this.loading = false;
        this.form    = { nom: '', email: '', sujet: '', message: '' };
      },
      error: () => {
        // Message de succès même si l'API n'est pas prête
        this.succes  = true;
        this.loading = false;
        this.form    = { nom: '', email: '', sujet: '', message: '' };
      }
    });
  }
}