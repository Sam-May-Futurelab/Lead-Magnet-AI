/**
 * RevenueCat Service for iOS In-App Purchases
 * Uses the official @revenuecat/purchases-capacitor plugin
 */

import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL, type PurchasesPackage, type CustomerInfo } from '@revenuecat/purchases-capacitor';

// RevenueCat API Key - Set this in your .env file
const REVENUECAT_IOS_KEY = import.meta.env.VITE_REVENUECAT_IOS_KEY;

export interface SubscriptionInfo {
    isActive: boolean;
    plan: 'free' | 'pro' | 'unlimited';
    expirationDate?: Date;
    isLifetime: boolean;
}

export interface SubscriptionPackage {
    identifier: string;
    packageType: string;
    product: {
        identifier: string;
        title: string;
        description: string;
        priceString: string;
        price: number;
    };
    offeringIdentifier: string;
}

class RevenueCatService {
    private initialized = false;
    private initPromise: Promise<boolean> | null = null;

    /**
     * Check if platform supports IAP
     */
    isSupported(): boolean {
        return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
    }

    /**
     * Ensure RevenueCat is initialized before any operation
     */
    private async ensureInitialized(): Promise<boolean> {
        if (!this.isSupported()) {
            return false;
        }

        if (this.initialized) {
            return true;
        }

        // If already initializing, wait for it
        if (this.initPromise) {
            return this.initPromise;
        }

        // Start initialization
        this.initPromise = this.doInitialize();
        return this.initPromise;
    }

    private async doInitialize(): Promise<boolean> {
        try {
            if (!REVENUECAT_IOS_KEY) {
                console.warn('[RevenueCat] No API key configured');
                return false;
            }

            await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
            await Purchases.configure({
                apiKey: REVENUECAT_IOS_KEY,
            });

            this.initialized = true;
            console.log('[RevenueCat] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[RevenueCat] Failed to initialize:', error);
            this.initPromise = null;
            return false;
        }
    }

    /**
     * Initialize with user ID (call after sign in)
     */
    async initialize(userId?: string): Promise<void> {
        const ready = await this.ensureInitialized();
        if (!ready) return;

        if (userId) {
            try {
                await Purchases.logIn({ appUserID: userId });
                console.log('[RevenueCat] User identified:', userId);
            } catch (error) {
                console.error('[RevenueCat] Failed to identify user:', error);
            }
        }
    }

    /**
     * Get available subscription packages
     */
    async getOfferings(): Promise<SubscriptionPackage[]> {
        const ready = await this.ensureInitialized();
        if (!ready) return [];

        try {
            const offerings = await Purchases.getOfferings();
            const packages: SubscriptionPackage[] = [];

            if (offerings.current?.availablePackages) {
                for (const pkg of offerings.current.availablePackages) {
                    packages.push({
                        identifier: pkg.identifier,
                        packageType: pkg.packageType,
                        product: {
                            identifier: pkg.product.identifier,
                            title: pkg.product.title,
                            description: pkg.product.description,
                            priceString: pkg.product.priceString,
                            price: pkg.product.price,
                        },
                        offeringIdentifier: pkg.offeringIdentifier,
                    });
                }
            }

            console.log('[RevenueCat] Got offerings:', packages.length);
            return packages;
        } catch (error) {
            console.error('[RevenueCat] Failed to get offerings:', error);
            return [];
        }
    }

    /**
     * Get products by IDs (for consumables like credit packs)
     */
    async getProducts(productIds: string[]): Promise<SubscriptionPackage[]> {
        const ready = await this.ensureInitialized();
        if (!ready) return [];

        try {
            const result = await Purchases.getProducts({ productIdentifiers: productIds });
            return result.products.map(product => ({
                identifier: product.identifier,
                packageType: 'CUSTOM',
                product: {
                    identifier: product.identifier,
                    title: product.title,
                    description: product.description,
                    priceString: product.priceString,
                    price: product.price,
                },
                offeringIdentifier: 'custom',
            }));
        } catch (error) {
            console.error('[RevenueCat] Failed to get products:', error);
            return [];
        }
    }

    /**
     * Purchase a package
     */
    async purchasePackage(pkg: SubscriptionPackage): Promise<CustomerInfo | null> {
        const ready = await this.ensureInitialized();
        if (!ready) return null;

        try {
            // Get the actual package from offerings
            const offerings = await Purchases.getOfferings();
            const actualPackage = offerings.current?.availablePackages.find(
                p => p.identifier === pkg.identifier
            );

            if (!actualPackage) {
                throw new Error('Package not found');
            }

            const result = await Purchases.purchasePackage({ aPackage: actualPackage });
            console.log('[RevenueCat] Purchase successful');
            return result.customerInfo;
        } catch (error: unknown) {
            const err = error as { code?: string; userCancelled?: boolean };
            if (err.code === 'PURCHASE_CANCELLED' || err.userCancelled) {
                console.log('[RevenueCat] Purchase cancelled by user');
                return null;
            }
            console.error('[RevenueCat] Purchase failed:', error);
            throw error;
        }
    }

    /**
     * Purchase a product by ID (for consumables)
     */
    async purchaseProduct(productId: string): Promise<CustomerInfo | null> {
        const ready = await this.ensureInitialized();
        if (!ready) return null;

        try {
            const result = await Purchases.purchaseStoreProduct({
                product: { identifier: productId } as PurchasesPackage['product'],
            });
            console.log('[RevenueCat] Product purchase successful');
            return result.customerInfo;
        } catch (error: unknown) {
            const err = error as { code?: string; userCancelled?: boolean };
            if (err.code === 'PURCHASE_CANCELLED' || err.userCancelled) {
                console.log('[RevenueCat] Purchase cancelled by user');
                return null;
            }
            console.error('[RevenueCat] Product purchase failed:', error);
            throw error;
        }
    }

    /**
     * Restore previous purchases
     */
    async restorePurchases(): Promise<CustomerInfo | null> {
        const ready = await this.ensureInitialized();
        if (!ready) return null;

        try {
            const result = await Purchases.restorePurchases();
            console.log('[RevenueCat] Purchases restored');
            return result.customerInfo;
        } catch (error) {
            console.error('[RevenueCat] Failed to restore purchases:', error);
            throw error;
        }
    }

    /**
     * Get current customer info
     */
    async getCustomerInfo(): Promise<CustomerInfo | null> {
        const ready = await this.ensureInitialized();
        if (!ready) return null;

        try {
            const result = await Purchases.getCustomerInfo();
            return result.customerInfo;
        } catch (error) {
            console.error('[RevenueCat] Failed to get customer info:', error);
            return null;
        }
    }

    /**
     * Get subscription status from customer info
     */
    getSubscriptionInfo(customerInfo: CustomerInfo | null): SubscriptionInfo {
        if (!customerInfo) {
            return { isActive: false, plan: 'free', isLifetime: false };
        }

        const entitlements = customerInfo.entitlements.active;

        // Check for "Lead Magnet Pro" entitlement (covers both monthly and lifetime)
        const proEntitlement = entitlements['Lead Magnet Pro'] ||
            entitlements['unlimited'] ||
            entitlements['lifetime'];

        if (proEntitlement) {
            // Check if it's a lifetime (non-renewing) purchase
            const isLifetime = proEntitlement.productIdentifier?.includes('lifetime') ||
                proEntitlement.productIdentifier?.includes('unlimited') ||
                !proEntitlement.willRenew;

            if (isLifetime) {
                return {
                    isActive: true,
                    plan: 'unlimited',
                    isLifetime: true,
                };
            }

            // It's a monthly subscription
            return {
                isActive: true,
                plan: 'pro',
                expirationDate: proEntitlement.expirationDate
                    ? new Date(proEntitlement.expirationDate)
                    : undefined,
                isLifetime: false,
            };
        }

        // Check for pro subscription (legacy)
        if (entitlements['pro']) {
            return {
                isActive: true,
                plan: 'pro',
                expirationDate: entitlements['pro'].expirationDate
                    ? new Date(entitlements['pro'].expirationDate)
                    : undefined,
                isLifetime: false,
            };
        }

        return { isActive: false, plan: 'free', isLifetime: false };
    }

    /**
     * Identify user on sign in
     */
    async identifyUser(userId: string): Promise<void> {
        const ready = await this.ensureInitialized();
        if (!ready) return;

        try {
            await Purchases.logIn({ appUserID: userId });
            console.log('[RevenueCat] User identified:', userId);
        } catch (error) {
            console.error('[RevenueCat] Failed to identify user:', error);
        }
    }

    /**
     * Log out user
     */
    async logoutUser(): Promise<void> {
        const ready = await this.ensureInitialized();
        if (!ready) return;

        try {
            await Purchases.logOut();
            console.log('[RevenueCat] User logged out');
        } catch (error) {
            console.error('[RevenueCat] Failed to logout:', error);
        }
    }
}

export const revenueCatService = new RevenueCatService();
