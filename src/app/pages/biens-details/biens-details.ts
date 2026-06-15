import { Component, OnInit } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BiensPublicsService, BienPublic } from '../../services/biens-publics';
import { DemandeVisiteService, DemandeVisite } from '../../services/demande-visite';

@Component({
  selector: 'app-biens-details',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule],
  templateUrl: './biens-details.html',
  styleUrls: ['./biens-details.css']
})
export class BiensDetailsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private biensService: BiensPublicsService,
    private demandeService: DemandeVisiteService
  ) {}

  telephone = '+237 6 95 12 34 56';

  bien: BienPublic | null = null;
  images: string[] = [];
  imageActive = 0;

  loading = true;
  erreur  = '';
  favori  = false;

  // ── Formulaire de demande de visite ──
  form: DemandeVisite = {
    bien: 0, nom: '', telephone: '', email: '',
    message: '', date_souhaitee: ''
  };

  envoiEnCours = false;
  envoiSucces  = false;
  envoiErreur  = '';

  // ── Caractéristiques affichées ──
  get caracteristiques(): { icone: string; label: string; valeur: string }[] {
    if (!this.bien) return [];
    return [
      { icone: 'ti ti-bed',     label: 'Chambres',   valeur: `${this.bien.chambres}` },
      { icone: 'ti ti-bath',    label: 'Salles de bain', valeur: `${this.bien.bains}` },
      { icone: 'ti ti-ruler',   label: 'Superficie', valeur: `${this.bien.superficie} m²` },
      { icone: 'ti ti-tag',     label: 'Type',       valeur: this.bien.type },
      { icone: 'ti ti-map-pin', label: 'Localisation', valeur: this.bien.localisation },
      { icone: 'ti ti-home-check', label: 'Statut',  valeur: this.bien.statut },
    ];
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.chargerBien(id);
  }

  chargerBien(id: number): void {
    this.loading = true;
    this.biensService.getBienPublic(id).subscribe({
      next: (data: BienPublic) => {
        this.bien = data;
        this.images = data.images && data.images.length > 0
          ? data.images
          : [this.getImageDefaut(data)];
        this.form.bien = data.id;
        this.loading = false;
      },
      error: (err: any) => {
        this.erreur  = 'Ce bien est introuvable ou n\'est plus disponible.';
        this.loading = false;
      }
    });
  }

  private getImageDefaut(bien: BienPublic): string {
    const defaults: Record<string, string> = {
      'Maison':      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=75',
      'Appartement': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=75',
      'Studio':      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=75',
    };
    return defaults[bien.type] ?? defaults['Maison'];
  }

  getBadgeClass(statut: string): string {
    return statut === 'Disponible' ? 'badge-dispo' : 'badge-occ';
  }

  changerImage(i: number): void {
    this.imageActive = i;
  }

  toggleFavori(): void {
    this.favori = !this.favori;
  }

  // ── Envoi de la demande de visite ──
  envoyerDemande(): void {
    this.envoiErreur = '';

    if (!this.form.nom || !this.form.telephone || !this.form.email) {
      this.envoiErreur = 'Merci de remplir tous les champs obligatoires.';
      return;
    }

    this.envoiEnCours = true;
    this.demandeService.envoyerDemande(this.form).subscribe({
      next: () => {
        this.envoiEnCours = false;
        this.envoiSucces  = true;
        this.form = {
          bien: this.bien?.id ?? 0,
          nom: '', telephone: '', email: '',
          message: '', date_souhaitee: ''
        };
      },
      error: (err: any) => {
        this.envoiEnCours = false;
        this.envoiErreur  = 'Une erreur est survenue, veuillez réessayer.';
      }
    });
  }
}
