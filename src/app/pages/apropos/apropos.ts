import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-apropos',
  standalone: true,
  imports: [RouterLink, NgFor],
  templateUrl: './apropos.html',
  styleUrls: ['./apropos.css']
})
export class AProposComponent {

  telephone = '+237 6 95 12 34 56';

  stats = [
    { val: '5+',   label: 'Années d\'expérience' },
    { val: '500+', label: 'Biens gérés'           },
    { val: '1200+',label: 'Clients satisfaits'    },
    { val: '98%',  label: 'Taux de satisfaction'  },
  ];

  equipe = [
    { nom: 'Jean-Paul Nkengne', poste: 'Directeur Général',      initiales: 'JN', couleur: '#2563eb' },
    { nom: 'Marie Ateba',       poste: 'Responsable Technique',   initiales: 'MA', couleur: '#7c3aed' },
    { nom: 'René Biyong',       poste: 'Agent Immobilier Senior', initiales: 'RB', couleur: '#0d9488' },
    { nom: 'Sophie Ndong',      poste: 'Responsable Clientèle',   initiales: 'SN', couleur: '#ea580c' },
  ];

  valeurs = [
    { icone: 'ti ti-shield-check', titre: 'Intégrité',    desc: 'Nous agissons avec honnêteté et transparence dans toutes nos transactions.',         couleur: 'wi-blue'   },
    { icone: 'ti ti-star',         titre: 'Excellence',   desc: 'Nous visons l\'excellence dans chaque service que nous offrons à nos clients.',       couleur: 'wi-amber'  },
    { icone: 'ti ti-users',        titre: 'Proximité',    desc: 'Nous plaçons la relation client au cœur de notre activité.',                          couleur: 'wi-green'  },
    { icone: 'ti ti-chart-line',   titre: 'Innovation',   desc: 'Nous utilisons les dernières technologies pour simplifier la gestion immobilière.',   couleur: 'wi-purple' },
  ];
}