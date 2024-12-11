import { DiffCheckerService } from './service.js';
import {
  IDiffCheckerServiceOptions,
  IExtraOptions,
  CompareInfo,
  ResultBuilder,
  IStatisticsResults,
  CompareFileAsync,
  CompareFileSync,
  CompareNameHandler,
  FilterHandler,
  RealPathOptions,
  CompareMode
} from './types.js';

import { DiffReason, HashAlgorithms } from './services/EntryService/index.js';

export {
  DiffCheckerService,
  type IDiffCheckerServiceOptions,
  type IExtraOptions,
  type CompareInfo,
  type ResultBuilder,
  type IStatisticsResults,
  type CompareFileAsync,
  type CompareFileSync,
  type CompareNameHandler,
  type FilterHandler,
  type RealPathOptions,
  HashAlgorithms,
  CompareMode,
  DiffReason
};
