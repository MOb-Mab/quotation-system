// frontend/src/services/quotation.service.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getQuotations = async (page = 1, limit = 10, search = '', status = '') => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  const res = await api.get(`/quotations?${params.toString()}`);
  return res.data;
};

export const getQuotationById = async (id) => {
  const res = await api.get(`/quotations/${id}`);
  return res.data;
};

export const createQuotation = async (data) => {
  const res = await api.post('/quotations', data);
  return res.data;
};

export const updateQuotation = async (id, data) => {
  const res = await api.put(`/quotations/${id}`, data);
  return res.data;
};

export const deleteQuotation = async (id) => {
  const res = await api.delete(`/quotations/${id}`);
  return res.data;
};