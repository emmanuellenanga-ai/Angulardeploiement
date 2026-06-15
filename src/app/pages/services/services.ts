import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, NgFor],
  templateUrl: './services.html',
  styleUrls: ['./services.css']
})
export class ServicesComponent {

  telephone = '+237 6 95 12 34 56';

  services = [
    {
      icone: 'ti ti-building',
      titre: 'Gestion locative complète',
      desc: 'Prise en charge totale de vos biens : recherche de locataires, rédaction de contrats, encaissement des loyers et suivi des paiements.',
      features: ['Mise en location rapide','Vérification des locataires','Gestion des contrats','Suivi des paiements'],
      couleur: 'svc-blue',
      badge: 'Populaire'
    },
    {
      icone: 'ti ti-file-text',
      titre: 'Rédaction de contrats',
      desc: 'Rédaction et gestion de vos contrats de bail conformes à la législation camerounaise en vigueur.',
      features: ['Contrats conformes à la loi','Renouvellement automatique','Archivage numérique','Signature électronique'],
      couleur: 'svc-purple',
      badge: null
    },
    {
      icone: 'ti ti-credit-card',
      titre: 'Suivi des paiements',
      desc: 'Collecte et suivi des loyers avec génération automatique de reçus PDF et relances en cas d\'impayés.',
      features: ['Collecte automatisée','Reçus PDF instantanés','Relances impayés','Rapport mensuel'],
      couleur: 'svc-green',
      badge: null
    },
    {
      icone: 'ti ti-chart-bar',
      titre: 'Rapports & analyses',
      desc: 'Tableaux de bord détaillés pour suivre vos performances et optimiser la rentabilité de votre portefeuille.',
      features: ['Tableau de bord temps réel','Taux d\'occupation','Revenus vs charges','Export PDF/Excel'],
      couleur: 'svc-orange',
      badge: null
    },
    {
      icone: 'ti ti-tool',
      titre: 'Gestion des travaux',
      desc: 'Suivi et coordination des travaux d\'entretien et de rénovation de vos biens immobiliers.',
      features: ['Demandes d\'intervention','Suivi des prestataires','Devis et factures','Planning travaux'],
      couleur: 'svc-teal',
      badge: 'Nouveau'
    },
    {
      icone: 'ti ti-headset',
      titre: 'Support 24/7',
      desc: 'Une équipe dédiée disponible à toute heure pour répondre à vos questions et gérer les urgences.',
      features: ['Assistance téléphonique','Support par email','Chat en ligne','Intervention d\'urgence'],
      couleur: 'svc-red',
      badge: null
    },
  ];

  processus = [
    { num: '01', titre: 'Consultation',   desc: 'Rencontrez notre équipe pour définir vos besoins et objectifs.'    },
    { num: '02', titre: 'Évaluation',     desc: 'Nous évaluons votre bien et définissons la stratégie adaptée.'     },
    { num: '03', titre: 'Mise en place',  desc: 'Création de votre espace et configuration de vos biens.'           },
    { num: '04', titre: 'Suivi continu',  desc: 'Gestion quotidienne et rapports réguliers sur vos performances.'   },
  ];
}