export const ApiUrl = {
  auth: {
    login: '/login',
  },
  common: '/api/executeproc',
  email: '/api/email',
  report: '/report',
  twilioChatToken: '/api/twilio-token/chat',
  twilioVideoToken: '/api/twilio-token/video',
  twilioCallToken: '/api/accessToken/web',
  createChatRoom: '/api/twilio/chat-room/appointment',
  queryExecute: '/api/executequery',
  admin: {
    addSlot: '/people/add-time-slot',
    addSlotOveride: '/people/add-time-slot-overide',
    updateUserPassword: '/user/admin-update-password',
  },
  patient: {
    questions: '/api/get-questions',
  },
  medication: '/people/add-prescription-medication',
  uploadFile: '/report/upload',
  uploadFilePoi: '/report/upload/poi',
  printPrescription: '/report/prescription-pdf',
  getPeople: '/people/get-peoples',
  getPeopleInfo: '/people/get-people-info',
  searchPeople: '/people/search-peoples',
  peopleSchedule: '/people/get-people-schedule',
  payuKeys: '/payu/generate-tx-id',
  payuInvoice: '/payu/payment/invoice',
  completeAssessment: '/firstassesment/complete',
  notifyUser: '/notification/send-push',
  notifyUsermessage: '/notification/send-push-message'
};
export const TestURL = 'https://noworrynotension.in/RelaxNow/Register/';
export const CheckoutURL = 'https://noworrynotension.in/RelaxNow/checkout/';
export const CorporateURL = 'https://noworrynotension.in/RelaxNow/OCR?code=';
export const b2bLogin = 'https://noworrynotension.in/RelaxNow/b2b/login/';
//export const TestURL = 'http://localhost:4002/Register/';
