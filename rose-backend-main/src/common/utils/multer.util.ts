import { Request } from 'express';
import { mkdirSync } from 'fs';
import { extname, join } from 'path';
import { ValidationMessage } from '../enums/message.enum';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
export type CallbackDestination = (
  error: Error | null,
  destination: string,
) => void;
export type CallbackFileName = (
  error: Error | null,
  destination: string,
) => void;
export type multerFile = Express.Multer.File;
export function multerFilename(
  req: Request,
  file: multerFile,
  callback: CallbackFileName,
): void {
  {
    const ext = extname(file.originalname).toLowerCase()
    if(!isValidImage(ext)) {
      callback(new BadRequestException(ValidationMessage.ImageFormatIncorrect), '');
    } else {
      const filename = `${Date.now()}${ext}`;
      callback(null, filename);
    }
  }
}
export function multerDestination(fieldName: string) {
  return function (
    req: Request,
    file: multerFile,
    callback: CallbackDestination,
  ): void {
    let path = join('public', 'uploads', fieldName);
    mkdirSync(path, { recursive: true });
    callback(null, path);
  };
}
export function isValidImage(ext: string) {
  return [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp", ".tiff", ".ico", ".jpe"].includes(ext);
}
export function multerProfileStorage(folderName: string) {
  return diskStorage({
    destination: multerDestination(folderName),
    filename: multerFilename,
  })
}