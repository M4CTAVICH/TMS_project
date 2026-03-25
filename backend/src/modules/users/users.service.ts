import bcrypt from 'bcrypt';
import prisma from '../../config/prisma';
import { CreateUserDTO, UpdateUserDTO } from '../../shared/types';
import { BadRequestError, NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { getPaginationParams, getPaginationMeta } from '../../shared/utils/pagination';

export class UsersService {
  async createUser(data: CreateUserDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    // Normalize locationId: convert empty strings to null/undefined
    if (data.locationId === '') {
      delete data.locationId;
    }

    // Validate location requirement for non-MANAGER and non-TRANSPORT_PROVIDER roles
    if (data.role !== 'MANAGER' && data.role !== 'TRANSPORT_PROVIDER' && !data.locationId) {
      throw new BadRequestError(
        `Users with role ${data.role} must have a location assigned`
      );
    }

    // MANAGER and TRANSPORT_PROVIDER roles must not have a location
    if ((data.role === 'MANAGER' || data.role === 'TRANSPORT_PROVIDER') && data.locationId) {
      throw new BadRequestError(`${data.role} users should not have a location assigned`);
    }

    // Verify location exists if provided
    if (data.locationId && typeof data.locationId === 'string') {
      const location = await prisma.location.findUnique({
        where: { id: data.locationId },
      });
      if (!location) {
        throw new BadRequestError('Location not found');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        locationId: data.locationId || null,
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            locationType: true,
            address: true,
          },
        },
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
          locationId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          location: {
            select: {
              id: true,
              name: true,
              locationType: true,
              address: true,
            },
          },
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
        locationId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        location: {
          select: {
            id: true,
            name: true,
            locationType: true,
            address: true,
          },
        },
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

    // Normalize locationId: convert empty strings to undefined (don't include in update)
    if (data.locationId === '') {
      delete data.locationId;
    }

    // Validate location requirements when updating role or location
    const newRole = data.role || user.role;
    const newLocationId = data.locationId !== undefined ? data.locationId : user.locationId;

    if (newRole !== 'MANAGER' && newRole !== 'TRANSPORT_PROVIDER' && !newLocationId) {
      throw new BadRequestError(
        `Users with role ${newRole} must have a location assigned`
      );
    }

    if ((newRole === 'MANAGER' || newRole === 'TRANSPORT_PROVIDER') && newLocationId) {
      throw new BadRequestError(`${newRole} users should not have a location assigned`);
    }

    // Verify location exists if provided or changed
    if (data.locationId && typeof data.locationId === 'string') {
      const location = await prisma.location.findUnique({
        where: { id: data.locationId },
      });
      if (!location) {
        throw new BadRequestError('Location not found');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        locationId: data.locationId !== undefined ? (data.locationId || null) : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        locationId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        location: {
          select: {
            id: true,
            name: true,
            locationType: true,
            address: true,
          },
        },
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
