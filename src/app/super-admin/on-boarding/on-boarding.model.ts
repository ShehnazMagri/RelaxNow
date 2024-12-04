const date = new Date();
const currentDate =
  date.getFullYear() +
  '-' +
  (date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)) +
  '-' +
  (date.getDate() > 9 ? date.getDate() : '0' + date.getDate());
export class OnBoardingModel {
  ID = 0;
  Name = '';
  RELATIONSHIP_NUMBER = '';
  Prefix = '';
  FIRST_NAME = '';
  MIDDLE_NAME = '';
  LAST_NAME = '';
  CATEGORY_ID = '';
  GUARDIAN_NAME = '';
  DOB = '';
  UID_NUMBER = '';
  GENDER_ID = '';
  MARITAL_STATUS_ID = '';
  CITIZEN_COUNTRY_ID = '';
  MONTHLY_INCOME = '';
  OCCUPATION = '';
  ACTIVE = '';
  Mobile = '';
  EMAIL = '';
  REGISTRATION_DATE = currentDate;
  ADDRESS = '';
  ROLEID = '';
  IDENTIFICATION_NUMBER = '';
  CREATED_Date: string | null = currentDate;
  CREATED_BY: string | null = '';
  MODIFIED_BY: string | null = '';
  MODIFIED_DATE: string | null = currentDate;
  IS_VISITOR = false;
}
