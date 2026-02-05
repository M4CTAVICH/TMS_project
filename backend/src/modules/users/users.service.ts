import bcrypt from 'bcrypt';
import prisma from '../../config/prisma';
import { CreateUserDTO, UpdateUserDTO } from '../../shared/types';
import { BadRequestError, NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { getPaginationParams, getPaginationMeta } from '../../shared/utils/pagination';

export class UserService {
  async createUser(data: CreateUserDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getUsers(page: number = 1, limit: number = 20, role?: string) {
    const { skip, take } = getPaginationParams(page, limit);

    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const meta = getPaginationMeta(total, page, limit);

    return { users, meta };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        location: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateUser(id: string, data: UpdateUserDTO) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async activateUser(id: string) {
    return this.updateUser(id, { isActive: true });
  }

  async deactivateUser(id: string) {
    return this.updateUser(id, { isActive: false });
  }
}
