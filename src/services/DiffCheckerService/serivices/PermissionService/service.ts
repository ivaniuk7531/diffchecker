import { PermissionDeniedState } from './types.js';
import { IEntry } from '../EntryService/index.js';

export class PermissionService {
  static getPermissionDeniedState(
    entry1: IEntry,
    entry2: IEntry
  ): PermissionDeniedState {
    if (entry1.isPermissionDenied && entry2.isPermissionDenied) {
      return PermissionDeniedState.ACCESS_ERROR_BOTH;
    } else if (entry1.isPermissionDenied) {
      return PermissionDeniedState.ACCESS_ERROR_LEFT;
    } else if (entry2.isPermissionDenied) {
      return PermissionDeniedState.ACCESS_ERROR_RIGHT;
    } else {
      return PermissionDeniedState.ACCESS_OK;
    }
  }

  static getPermissionDeniedStateWhenLeftMissing(
    entry2: IEntry
  ): PermissionDeniedState {
    return entry2.isPermissionDenied
      ? PermissionDeniedState.ACCESS_ERROR_RIGHT
      : PermissionDeniedState.ACCESS_OK;
  }

  static getPermissionDeniedStateWhenRightMissing(
    entry1: IEntry
  ): PermissionDeniedState {
    return entry1.isPermissionDenied
      ? PermissionDeniedState.ACCESS_ERROR_LEFT
      : PermissionDeniedState.ACCESS_OK;
  }
}
