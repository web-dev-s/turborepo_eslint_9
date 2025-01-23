import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class AppService {
  constructor() {}
  getHello(): string {
    return 'Hello World!';
  }
  public get<T>(key: string, defaultValue?: T): T {
    try {
      const value = (process.env[key] as T) || (defaultValue as T);
      if (!value) {
        throw new Error('not found key: ' + key);
      }
      return value;
    } catch (err) {
      if (defaultValue) {
        return defaultValue;
      }
      console.error(err);
      throw createAppSettingMissingError(key);
    }
  }
}
export function createAppSettingMissingError(settingName: string): Error {
  const errorMessage = `Missing required App Setting "${settingName}"!. Make sure the App Settings are properly loaded. HINT: when running locally, the settings are read from ".env.{process.env.ENV}" file`;
  return new Error(errorMessage);
}
