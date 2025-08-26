import { FileInterceptor } from '@nestjs/platform-express';
import { multerProfileStorage } from '../utils/multer.util';

export function UploadFile(fieldName: string, folderName: string = 'images') {
  return class UploadUtility extends FileInterceptor(fieldName, {
    storage: multerProfileStorage(folderName),
  }) {};
}