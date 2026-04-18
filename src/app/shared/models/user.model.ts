export interface IUser {
    id?: string;
    name: string;
    email: string;
    password_hash?: string;
    refresh_tokens?: string[];
    isVerified?: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    googleId?: string;
    organizationId?: string;
    personalSubscription: {
        status: "active" | "inactive" | "past_due";
        plan: "individual_pro" | "free";
        expiresAt?: Date;
        paypalSubscriptionId?: string;
    };
}

export interface UserResponse {
    message: string
}

export interface IncludedUserResponse {
    message: string,
    user: IUser
}