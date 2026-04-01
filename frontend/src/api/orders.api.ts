import client from './client';
import type {
  OrderResponse,
  OrderListResponse,
  OrderRequest,
  OrderStatus,
  StatusChangeRequest,
} from './types';

export async function getOrders(status?: OrderStatus): Promise<OrderListResponse[]> {
  const params = status ? { status } : {};
  const response = await client.get<OrderListResponse[]>('/orders', { params });
  return response.data;
}

export async function getOrderById(id: string): Promise<OrderResponse> {
  const response = await client.get<OrderResponse>(`/orders/${id}`);
  return response.data;
}

export async function createOrder(data: OrderRequest): Promise<OrderResponse> {
  const response = await client.post<OrderResponse>('/orders', data);
  return response.data;
}

export async function updateOrder(id: string, data: OrderRequest): Promise<OrderResponse> {
  const response = await client.put<OrderResponse>(`/orders/${id}`, data);
  return response.data;
}

export async function changeOrderStatus(id: string, data: StatusChangeRequest): Promise<OrderResponse> {
  const response = await client.post<OrderResponse>(`/orders/${id}/status`, data);
  return response.data;
}
