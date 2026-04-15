import { ChangeDetectionStrategy, Component } from '@angular/core';

type FeatureItem = {
  title: string;
  description: string;
};

@Component({
  selector: 'app-features-overview',
  imports: [],
  templateUrl: './features-overview.html',
  styleUrl: './features-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesOverview {
  protected readonly featureItems: FeatureItem[] = [
    {
      title: 'Audio y video estables',
      description: 'Calidad HD y control adaptativo para conexiones variables.',
    },
    {
      title: 'Colaboracion integrada',
      description: 'Chat en vivo, notas rapidas y comparticion de archivos sin salir de la reunion.',
    },
    {
      title: 'Seguridad empresarial',
      description: 'Accesos por rol, cifrado de extremo a extremo y registros de actividad.',
    },
  ];
}
