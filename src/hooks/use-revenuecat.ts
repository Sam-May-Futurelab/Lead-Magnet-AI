/**
 * React hook for RevenueCat integration
 */

import { useState, useEffect, useCallback } from 'react';
import { revenueCatService, type SubscriptionInfo, type SubscriptionPackage } from '../lib/revenuecat';
import { useAuth } from './use-auth';
import type { CustomerInfo } from '@revenuecat/purchases-capacitor';

export function useRevenueCat() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [offerings, setOfferings] = useState<SubscriptionPackage[]>([]);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [subscription, setSubscription] = useState<SubscriptionInfo>({
        isActive: false,
        plan: 'free',
        isLifetime: false,
    });

    // Initialize RevenueCat when user changes
    useEffect(() => {
        const init = async () => {
            if (!revenueCatService.isSupported()) {
                setIsLoading(false);
                return;
            }

            try {
                // Initialize with user ID if logged in
                await revenueCatService.initialize(user?.uid);

                // Get customer info
                const info = await revenueCatService.getCustomerInfo();
                setCustomerInfo(info);
                setSubscription(revenueCatService.getSubscriptionInfo(info));

                // Get offerings
                const pkgs = await revenueCatService.getOfferings();
                setOfferings(pkgs);
            } catch (error) {
                console.error('[useRevenueCat] Init error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [user?.uid]);

    // Purchase a package
    const purchase = useCallback(async (pkg: SubscriptionPackage): Promise<boolean> => {
        try {
            setIsLoading(true);
            const info = await revenueCatService.purchasePackage(pkg);

            if (info) {
                setCustomerInfo(info);
                setSubscription(revenueCatService.getSubscriptionInfo(info));
                return true;
            }
            return false;
        } catch (error) {
            console.error('[useRevenueCat] Purchase error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Purchase a product by ID
    const purchaseProduct = useCallback(async (productId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const info = await revenueCatService.purchaseProduct(productId);

            if (info) {
                setCustomerInfo(info);
                setSubscription(revenueCatService.getSubscriptionInfo(info));
                return true;
            }
            return false;
        } catch (error) {
            console.error('[useRevenueCat] Product purchase error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Restore purchases
    const restore = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            const info = await revenueCatService.restorePurchases();

            if (info) {
                setCustomerInfo(info);
                setSubscription(revenueCatService.getSubscriptionInfo(info));
                return true;
            }
            return false;
        } catch (error) {
            console.error('[useRevenueCat] Restore error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Refresh customer info
    const refresh = useCallback(async () => {
        try {
            const info = await revenueCatService.getCustomerInfo();
            setCustomerInfo(info);
            setSubscription(revenueCatService.getSubscriptionInfo(info));
        } catch (error) {
            console.error('[useRevenueCat] Refresh error:', error);
        }
    }, []);

    // Get the pro monthly package
    const proPackage = offerings.find(
        pkg => pkg.product.identifier.includes('pro') && pkg.product.identifier.includes('monthly')
    );

    // Get the unlimited/lifetime package
    const unlimitedPackage = offerings.find(
        pkg => pkg.product.identifier.includes('unlimited') || pkg.product.identifier.includes('lifetime')
    );

    return {
        isLoading,
        isSupported: revenueCatService.isSupported(),
        offerings,
        customerInfo,
        subscription,
        proPackage,
        unlimitedPackage,
        purchase,
        purchaseProduct,
        restore,
        refresh,
    };
}
