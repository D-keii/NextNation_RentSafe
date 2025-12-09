export type UserRole = 'tenant' | 'landlord';

export interface User {
  ic: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  role?: UserRole;
  preferredLocation?: string;
  budgetMin?: number;
  budgetMax?: number;
  profileComplete: boolean;
}

export type PropertyStatus = 'unverified' | 'verified';

export type OwnershipDocumentKey =
  | 'spaAgreement'
  | 'titleDeed'
  | 'utilityBill'
  | 'quitRent'
  | 'assessmentTax';

export type VerificationStatus = 'pending' | 'rejected' | 'approved';

export interface PropertyVerification {
  status: VerificationStatus;
  rejectionReason?: string;
  documents?: Partial<Record<OwnershipDocumentKey, string>>;
}

export interface Property {
  id: string;
  landlordIc: string;
  landlordName: string;
  title: string;
  description: string;
  address: string;
  postcode?: string;
  city?: string;
  state?: string;
  housingType?: 'condo' | 'apartment' | 'studio' | 'house';
  price: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  amenities: string[];
  photos: string[];
  available: boolean;
  createdAt: string;
  status: PropertyStatus;
  verification?: PropertyVerification;
}

export interface Application {
  id: string;
  propertyId: string;
  tenantIc: string;
  tenantName: string;
  landlordIc: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  property?: Property;
}

export interface Contract {
  id: string;
  propertyId: string;
  tenantIc: string;
  landlordIc: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  photosApproved: boolean;
  tenantSigned: boolean;
  landlordSigned: boolean;
  tenantSignature?: DigitalSignature;
  landlordSignature?: DigitalSignature;
  status: 'pending_photos' | 'pending_tenant_approval' | 'pending_signatures' | 'fully_signed' | 'active' | 'completed';
  property?: Property;
}

export interface DigitalSignature {
  name: string;
  ic: string;
  timestamp: string;
  documentHash: string;
}

export interface Escrow {
  id: string;
  contractId: string;
  tenantIc: string;
  landlordIc: string;
  amount: number;
  status: 'pending' | 'secured' | 'release_requested' | 'released' | 'disputed';
  paymentMethod?: 'fpx' | 'duitnow';
  paidAt?: string;
  releasedAt?: string;
}

export interface RentalHistory {
  id: string;
  propertyId: string;
  tenantIc: string;
  landlordIc: string;
  startDate: string;
  endDate: string;
  contractId: string;
  escrowId: string;
  status: 'completed' | 'terminated';
}
