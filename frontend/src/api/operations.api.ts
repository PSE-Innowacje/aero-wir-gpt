import client from './client';
import type {
  OperationResponse,
  OperationListResponse,
  OperationRequest,
  OperationStatus,
  CommentRequest,
  StatusChangeRequest,
  KmlProcessingResult,
} from './types';

export async function getOperations(status?: OperationStatus): Promise<OperationListResponse[]> {
  const params = status ? { status } : {};
  const response = await client.get<OperationListResponse[]>('/operations', { params });
  return response.data;
}

export async function getOperationById(id: string): Promise<OperationResponse> {
  const response = await client.get<OperationResponse>(`/operations/${id}`);
  return response.data;
}

export async function createOperation(data: OperationRequest): Promise<OperationResponse> {
  const response = await client.post<OperationResponse>('/operations', data);
  return response.data;
}

export async function updateOperation(id: string, data: OperationRequest): Promise<OperationResponse> {
  const response = await client.put<OperationResponse>(`/operations/${id}`, data);
  return response.data;
}

export async function changeOperationStatus(id: string, data: StatusChangeRequest): Promise<OperationResponse> {
  const response = await client.post<OperationResponse>(`/operations/${id}/status`, data);
  return response.data;
}

export async function addOperationComment(id: string, data: CommentRequest): Promise<void> {
  await client.post(`/operations/${id}/comments`, data);
}

export async function uploadKml(file: File): Promise<KmlProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post<KmlProcessingResult>('/operations/upload-kml', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function downloadKml(operationId: string): Promise<Blob> {
  const response = await client.get(`/operations/${operationId}/kml`, {
    responseType: 'blob',
  });
  return response.data;
}
