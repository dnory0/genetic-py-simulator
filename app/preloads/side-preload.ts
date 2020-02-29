import { join } from 'path';

require(join(__dirname, 'chart-preload'));

window['sync-charts'] = () =>
  require(join(__dirname, '..', 'modules', 'sync-charts'));
