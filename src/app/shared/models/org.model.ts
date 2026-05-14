export interface IOrganization {
    id?: string;
    _id?: string;
    name: string;
    domain?: string;
    ownerId: string;
    logoUrl?: string;
    members: any[]; // Can be string[] or populated User objects
    isOwner?: boolean;
    subscription: {
        status: "active" | "inactive" | "past_due";
        plan: "organization_tier" | "free";
        expiresAt?: Date;
        paypalSubscriptionId?: string;
    };
}

export interface OrgResponse {
  message?: string;
  organization: IOrganization;
}

export interface IncludeOrgResponse {
  message: string;
  organization: IOrganization;
}