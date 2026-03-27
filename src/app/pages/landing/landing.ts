import { Component } from '@angular/core';
import { PublicHeader } from '../../layouts/public-header/public-header';
import { PublicFooter } from '../../layouts/public-footer/public-footer';
import { FeaturesOverview } from './features-overview/features-overview';
import { PricingTiers } from '../organization/pricing-tiers/pricing-tiers';

@Component({
  selector: 'app-landing',
  imports: [PublicHeader, FeaturesOverview, PricingTiers, PublicFooter],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {}
