// ============================================
// CATÁLOGO DE PRODUTOS - Utility Functions
// ============================================

/**
 * Format a number as Brazilian Real currency
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

/**
 * Format a date as Brazilian locale
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

/**
 * Generate a unique quote number
 */
export function generateQuoteNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `AS-${year}-${random}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}

/**
 * Get Cloudinary optimized image URL
 */
export function getCloudinaryUrl(
    publicId: string,
    options: { width?: number; height?: number; quality?: number } = {}
): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName || !publicId) return "/placeholder-furniture.jpg";

    const transforms: string[] = [];
    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    transforms.push(`q_${options.quality || 80}`);
    transforms.push("f_auto");
    transforms.push("c_fill");

    const transformStr = transforms.join(",");
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicId}`;
}

/**
 * Class names utility (simple cn)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(" ");
}
