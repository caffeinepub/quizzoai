import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Achievement {
    badgeName: string;
    earnedDate: bigint;
}
export interface UserProfile {
    username: string;
    totalTestsTaken: bigint;
    rank: string;
    streaks: bigint;
}
export interface TestHistory {
    date: bigint;
    score: bigint;
    board: string;
    chapter: string;
    className: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAchievement(badgeName: string): Promise<void>;
    addTestHistory(test: TestHistory): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTestHistory(chapter: string): Promise<void>;
    getAchievements(): Promise<Array<Achievement>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTestHistory(): Promise<Array<TestHistory>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
