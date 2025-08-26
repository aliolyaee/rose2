export enum BadRequestMessage {
  InvalidInput = 'ورودی نامعتبر است.',
  MissingFields = 'برخی از فیلدهای ضروری وارد نشده‌اند.',
  InvalidCredentials = 'نام کاربری یا رمز عبور اشتباه است.',
}

export enum AuthMessage {
  Unauthorized = 'دسترسی غیرمجاز.',
  LoginSuccess = 'ورود با موفقیت انجام شد.',
  LogoutSuccess = 'خروج با موفقیت انجام شد.',
  TokenExpired = 'توکن منقضی شده است.',
  TokenInvalid = 'توکن نامعتبر است.',
}

export enum NotFoundMessage {
  UserNotFound = 'کاربر یافت نشد.',
  ImageNotFound = 'عکس یافت نشد.',
  CategoryNotFound = 'دسته‌بندی یافت نشد.',
  ItemNotFound = 'آیتم یافت نشد.',
}

export enum ValidationMessage {
  ImageFormatIncorrect = 'فرمت تصویر باید یکی از فرمت های زیر باشد: png, jpg, jpeg, gif, svg, webp, bmp, tiff, ico, jpe',
  PasswordTooShort = 'رمز عبور باید حداقل ۶ کاراکتر باشد.',
  UsernameTaken = 'این نام کاربری قبلاً ثبت شده است.',
}

export enum PublicMessage {
  Created = 'با موفقیت ایجاد شد!',
  Updated = 'با موفقیت ویرایش شد!',
  Deleted = 'با موفقیت حذف شد!',
  Success = 'عملیات با موفقیت انجام شد!',
}

export enum ConflictMessage {
  DuplicateUsername = 'این نام کاربری قبلاً ثبت شده است.',
  DuplicateCategory = 'این دسته‌بندی قبلاً ثبت شده است.',
  DuplicateImage = 'این تصویر قبلاً ثبت شده است.',
}
