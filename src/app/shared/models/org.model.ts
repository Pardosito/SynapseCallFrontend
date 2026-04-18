export interface IOrganization {
    id?: string;
    name: string;
    domain?: string;
    ownerId: string;
    logoUrl?: string;
    members: string[];
    subscription: {
        status: "active" | "inactive" | "past_due";
        plan: "organization_tier" | "free";
        expiresAt?: Date;
        paypalSubscriptionId?: string;
    };
}

export interface OrgResponse {
  message: string
}

export interface IncludeOrgResponse {
  message: string;
  organization: IOrganization;
}