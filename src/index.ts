import { DiffCheckerService } from './services/DiffCheckerService/index.js';

const diffHashCheckerResult = await DiffCheckerService.compare(
  './test/dir1',
  './test/dir2',
  {
    compareFileHash: true,
    handlePermissionDenied: true,
    skipEmptyDirs: true
  }
);

console.log(diffHashCheckerResult.diffSet);
