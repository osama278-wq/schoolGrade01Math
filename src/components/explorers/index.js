import { CountingExplorer, TenFrameExplorer, PairsExplorer, EstimateExplorer, Puzzle7Explorer, OddEvenExplorer, BeadsExplorer, AddSubExplorer, ShopMoneyExplorer } from './NumberExplorers.jsx';
import { MeasureExplorer, ShapesExplorer, CapacityExplorer, CanteenExplorer, BalanceExplorer } from './MeasureShapeExplorers.jsx';

/** ربط نوع الاستكشاف في curriculum.json بالمكوّن التفاعلي */
export const EXPLORERS = {
  counting: CountingExplorer,
  tenframe: TenFrameExplorer,
  measure: MeasureExplorer,
  pairs: PairsExplorer,
  estimate: EstimateExplorer,
  shapes: ShapesExplorer,
  puzzle7: Puzzle7Explorer,
  capacity: CapacityExplorer,
  canteen: CanteenExplorer,
  balance: BalanceExplorer,
  oddeven: OddEvenExplorer,
  beads: BeadsExplorer,
  addsub: AddSubExplorer,
  shopmoney: ShopMoneyExplorer
};
