// frontend/src/services/product.service.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_URL}/products`,
  timeout: 30000,
});

// ✅ interceptor: คืน data ตรง ๆ
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response || error);
    throw error;
  }
);

class ProductService {
  async getAllProducts() {
    return await api.get('/');
  }

  async getProductById(id) {
    return await api.get(`/${id}`);
  }

  async createProduct(productData) {
    return await api.post('/', productData);
  }

  async updateProduct(id, productData) {
    return await api.put(`/${id}`, productData);
  }

  async deleteProduct(id) {
    return await api.delete(`/${id}`);
  }

  async searchProducts(query) {
    return await api.get(`/search/${query}`);
  }
}

export default new ProductService();
