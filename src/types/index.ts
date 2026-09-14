export type Screen =
  | 'home'
  | 'scan'
  | 'send'
  | 'balance'
  | 'history'
  | 'settings'
  | 'faq'
  | 'privacy'
  | 'setup'
  | 'auth';

export type Bank = {
  id: string;
  name: string;
 ussdCode: string;
};

export const BANKS: Bank[] = [
  { id: 'sbi', name: 'State Bank of India', ussdCode: '*99#' },
  { id: 'hdfc', name: 'HDFC Bank', ussdCode: '*99#' },
  { id: 'icici', name: 'ICICI Bank', ussdCode: '*99#' },
  { id: 'axis', name: 'Axis Bank', ussdCode: '*99#' },
  { id: 'pnb', name: 'Punjab National Bank', ussdCode: '*99#' },
  { id: 'bob', name: 'Bank of Baroda', ussdCode: '*99#' },
  { id: 'canara', name: 'Canara Bank', ussdCode: '*99#' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', ussdCode: '*99#' },
  { id: 'yes', name: 'Yes Bank', ussdCode: '*99#' },
  { id: 'idbi', name: 'IDBI Bank', ussdCode: '*99#' },
];
