import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DS_BRAND_DEFAULTS } from './ds-brand.config';

export type { DsBrandConfig, BrandSize } from './ds-brand.config';

@Component({
  selector: 'ds-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './ds-brand.html',
  styleUrl: './ds-brand.scss',
})
export class DsBrandComponent {
  readonly size     = input(DS_BRAND_DEFAULTS.size);
  readonly mark     = input(DS_BRAND_DEFAULTS.mark);
  readonly name     = input('PodIQ');
  readonly showName = input(true);
  readonly link     = input<string | null>('/');
}
