import { shopService } from './shopService';
import { orderService } from './orderService';
import { pickupService } from './pickupService';
import type { Shop } from '../types/shop.types';
import type { Order, OrderStatus } from '../types/order.types';
import type { PickupSlotResponse } from '../types/slot.types';

export interface QueueMetrics {
  waitingConfirmation: number;
  inPreparation: number;
  readyAtCounter: number;
  totalInQueue: number;
  activeSlotsCount: number;
  pendingSlotsCount: number;
}

export interface ShopDashboardData {
  shops: Shop[];
  orders: Order[];
  recentOrders: Order[];
  pickupSlots: PickupSlotResponse[];
  todayRevenue: number;
  totalOrdersCount: number;
  statusBreakdown: Record<OrderStatus, number>;
  queueMetrics: QueueMetrics;
}

export const shopOwnerService = {
  /**
   * Efficiently composes shop owner dashboard data from genuine backend endpoints.
   */
  async getDashboardSummary(): Promise<ShopDashboardData> {
    const [shops, ordersPage, pickupSlots] = await Promise.all([
      shopService.getMyShops().catch(() => [] as Shop[]),
      orderService.getShopOrders(undefined, 0, 50).catch(() => ({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 50 })),
      pickupService.getShopPickupSlots().catch(() => [] as PickupSlotResponse[]),
    ]);

    const orders = ordersPage.content || [];
    const totalOrdersCount = ordersPage.totalElements || orders.length;

    // Initialize status breakdown
    const statusBreakdown: Record<OrderStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      ACCEPTED: 0,
      PREPARING: 0,
      READY_FOR_PICKUP: 0,
      COLLECTED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      REJECTED: 0,
    };

    let todayRevenue = 0;

    orders.forEach((order) => {
      const s = order.status;
      if (statusBreakdown[s] !== undefined) {
        statusBreakdown[s]++;
      }
      if (s !== 'CANCELLED' && s !== 'REJECTED') {
        todayRevenue += Number(order.totalAmount || 0);
      }
    });

    const waitingConfirmation = statusBreakdown.PENDING;
    const inPreparation = (statusBreakdown.CONFIRMED || 0) + (statusBreakdown.ACCEPTED || 0) + (statusBreakdown.PREPARING || 0);
    const readyAtCounter = statusBreakdown.READY_FOR_PICKUP;
    const totalInQueue = waitingConfirmation + inPreparation + readyAtCounter;

    const pendingSlotsCount = pickupSlots.filter((s) => s.status === 'REQUESTED').length;
    const activeSlotsCount = pickupSlots.filter(
      (s) => s.status === 'ACCEPTED' || s.status === 'CUSTOMER_ACCEPTED' || s.status === 'COUNTER_PROPOSED'
    ).length;

    return {
      shops,
      orders,
      recentOrders: orders.slice(0, 10),
      pickupSlots,
      todayRevenue,
      totalOrdersCount,
      statusBreakdown,
      queueMetrics: {
        waitingConfirmation,
        inPreparation,
        readyAtCounter,
        totalInQueue,
        activeSlotsCount,
        pendingSlotsCount,
      },
    };
  },
};
