import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseComponent } from '~/app/framework/core';

@Component({
  selector: 'nxg-main',
  templateUrl: './main.component.html',
  styleUrls: ['main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent extends BaseComponent {
  onActivate(event$: any): void {
    // scrollContainer.scrollTop = 0;
  }
}
