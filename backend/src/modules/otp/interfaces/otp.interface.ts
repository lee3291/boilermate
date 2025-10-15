import {Listing} from '../../listings/interfaces/listing.interface';
export interface OTPRecord {
    otp: string
    expires: number
}

export interface User {
    id: string
    email: string
    hashedPassword: string
    isVerified: boolean
    listings: Listing[]
}