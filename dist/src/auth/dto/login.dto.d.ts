export declare enum UserRole {
    STAFF = "STAFF",
    COMPANY = "COMPANY",
    COLLABORATOR = "COLLABORATOR"
}
export declare class LoginDto {
    email?: string;
    password?: string;
    cpf?: string;
    role: UserRole;
}
