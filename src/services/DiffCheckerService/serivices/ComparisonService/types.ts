export interface IRestPair {
  rest1: string;
  rest2: string;
}

export interface IRestLines {
  restLines1: string[];
  restLines2: string[];
}

export interface ICompareLinesResult {
  isEqual: boolean;
  restLines1: string[];
  restLines2: string[];
}

export interface IRestLines {
  restLines1: string[];
  restLines2: string[];
}

export interface ICompareLineBatchResult {
  reachedEof: boolean;
  batchIsEqual: boolean;
  restLines: IRestLines;
}

export type NameCompareResult = -1 | 0 | 1;
