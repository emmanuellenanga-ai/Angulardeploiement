import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'biens-publics/:id',
    renderMode: RenderMode.Server // Généré sur le serveur à la demande, ou RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
