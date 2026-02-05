import prisma from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { getPaginationParams, getPaginationMeta } from '../../shared/utils/pagination';

interface CreateProductDTO {
  name: string;
  description?: string;
  sku: string;
  type: 'RAW_MATERIAL' | 'FINISHED_PRODUCT';
  unitWeight: number;
  unitPrice: number;
}

interface UpdateProductDTO {
  name?: string;
  description?: string;
  unitWeight?: number;
  unitPrice?: number;
  isActive?: boolean;
}

export class ProductService {
  async createProduct(data: CreateProductDTO) {
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingProduct) {
      throw new ConflictError('Product with this SKU already exists');
    }

    const product = await prisma.product.create({
      data,
    });

    return product;
  }

  async getProducts(page: number = 1, limit: number = 20, type?: string) {
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = { isActive: true };
    if (type) {
      where.type = type;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const meta = getPaginationMeta(total, page, limit);

    return { products, meta };
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async updateProduct(id: string, data: UpdateProductDTO) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
    });

    return updatedProduct;
  }

  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }

  async getRawMaterials(page: number = 1, limit: number = 20) {
    return this.getProducts(page, limit, 'RAW_MATERIAL');
  }

  async getFinishedProducts(page: number = 1, limit: number = 20) {
    return this.getProducts(page, limit, 'FINISHED_PRODUCT');
  }
}
