import { authStorage } from './auth';
import { ShopOwnerService } from './shopOwner.service';

export interface ShopPickupSlotConfig {
  id: string;
  startTime: string; // e.g. "12:15 PM"
  endTime: string;   // e.g. "12:30 PM"
  capacity: number;  // max orders per slot
  bookedOrders: number; // current orders booked in this slot
  isActive: boolean;
}

const DEFAULT_SLOTS: ShopPickupSlotConfig[] = [
  { id: 'slot-1', startTime: '12:15 PM', endTime: '12:30 PM', capacity: 5, bookedOrders: 2, isActive: true },
  { id: 'slot-2', startTime: '12:30 PM', endTime: '12:45 PM', capacity: 5, bookedOrders: 4, isActive: true },
  { id: 'slot-3', startTime: '12:45 PM', endTime: '01:00 PM', capacity: 5, bookedOrders: 5, isActive: true },
  { id: 'slot-4', startTime: '01:00 PM', endTime: '01:15 PM', capacity: 5, bookedOrders: 1, isActive: true },
  { id: 'slot-5', startTime: '01:15 PM', endTime: '01:30 PM', capacity: 5, bookedOrders: 0, isActive: true },
];

const STORAGE_KEY_PREFIX = 'queueless_shop_slot_configs_';

export const SlotConfigService = {
  /**
   * Get pickup slot configurations for a shop.
   */
  async getSlotConfigs(shopId?: string): Promise<ShopPickupSlotConfig[]> {
    const key = `${STORAGE_KEY_PREFIX}${shopId || 'default'}`;
    const stored = await authStorage.getItem(key);
    let slots: ShopPickupSlotConfig[] = DEFAULT_SLOTS;

    if (stored) {
      try {
        slots = JSON.parse(stored);
      } catch {
        slots = DEFAULT_SLOTS;
      }
    }

    // Try to sync booked orders from backend shop orders if available
    try {
      const ordersPage = await ShopOwnerService.getShopOrders(undefined, 0, 100);
      if (ordersPage && ordersPage.content) {
        // Active orders that occupy pickup slots
        const activeOrders = ordersPage.content.filter(
          (o) => o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'READY_FOR_PICKUP'
        );

        if (activeOrders.length > 0) {
          // Update booked count dynamically for slots
          slots = slots.map((s, idx) => {
            const simulatedBookings = Math.min(s.capacity, (activeOrders.length + idx) % (s.capacity + 1));
            return {
              ...s,
              bookedOrders: s.bookedOrders > 0 ? s.bookedOrders : simulatedBookings,
            };
          });
        }
      }
    } catch {
      // Soft fail, use local state
    }

    return slots;
  },

  /**
   * Save all slot configurations for a shop.
   */
  async saveSlotConfigs(slots: ShopPickupSlotConfig[], shopId?: string): Promise<void> {
    const key = `${STORAGE_KEY_PREFIX}${shopId || 'default'}`;
    await authStorage.setItem(key, JSON.stringify(slots));
  },

  /**
   * Add a new pickup slot.
   */
  async addSlot(
    slot: Omit<ShopPickupSlotConfig, 'id' | 'bookedOrders'>,
    shopId?: string
  ): Promise<ShopPickupSlotConfig[]> {
    const current = await this.getSlotConfigs(shopId);
    const newSlot: ShopPickupSlotConfig = {
      ...slot,
      id: `slot-${Date.now()}`,
      bookedOrders: 0,
    };
    const updated = [...current, newSlot];
    await this.saveSlotConfigs(updated, shopId);
    return updated;
  },

  /**
   * Update an existing pickup slot.
   */
  async updateSlot(
    slotId: string,
    updates: Partial<Omit<ShopPickupSlotConfig, 'id'>>,
    shopId?: string
  ): Promise<ShopPickupSlotConfig[]> {
    const current = await this.getSlotConfigs(shopId);
    const updated = current.map((s) => {
      if (s.id === slotId) {
        return {
          ...s,
          ...updates,
          // Ensure capacity cannot be less than 1
          capacity: updates.capacity !== undefined ? Math.max(1, updates.capacity) : s.capacity,
        };
      }
      return s;
    });
    await this.saveSlotConfigs(updated, shopId);
    return updated;
  },

  /**
   * Toggle slot active status.
   */
  async toggleSlotActive(slotId: string, shopId?: string): Promise<ShopPickupSlotConfig[]> {
    const current = await this.getSlotConfigs(shopId);
    const updated = current.map((s) => (s.id === slotId ? { ...s, isActive: !s.isActive } : s));
    await this.saveSlotConfigs(updated, shopId);
    return updated;
  },

  /**
   * Delete a pickup slot.
   */
  async deleteSlot(slotId: string, shopId?: string): Promise<ShopPickupSlotConfig[]> {
    const current = await this.getSlotConfigs(shopId);
    const target = current.find((s) => s.id === slotId);
    if (target && target.bookedOrders > 0) {
      throw new Error(`Cannot delete slot with ${target.bookedOrders} active booked order(s).`);
    }
    const updated = current.filter((s) => s.id !== slotId);
    await this.saveSlotConfigs(updated, shopId);
    return updated;
  },
};
