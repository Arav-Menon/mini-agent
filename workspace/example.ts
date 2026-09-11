export function isUserOver18(birthYear: number): boolean {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear >= 18;
}