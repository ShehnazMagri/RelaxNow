export class BasicInfoModel {
  PROFESSIONAL_TITLE = '';
  PROFESSIONAL_STATEMENT = '';
  PRACTICING_FROM = '';
  FIRST_CONSULTATION_FEE = '';
  FOLLOWUP_CONSULTATION_FEE = '';
  SLOT_PER_CLIENT = '';
  RESET_DAYS = '';
}

export class ContactInfoModel {
  address1 = '';
  address2 = '';
  city = '';
  state = '';
  country = '';
  postal = '';
}

export class EducationModel {
  ID = 0;
  QUALIFICATION = '';
  INSTITUTE = '';
  PRECUREMENT_YEAR = '';
}

export class ExperienceModel {
  ID = 0;
  HOSPITAL_NAME = '';
  HOSPITAL_ADDRESS = '';
  designation = '';
  START_TIME: any = '';
  END_TIME: any = '';
}
