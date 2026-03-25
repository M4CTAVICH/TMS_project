import prisma from '../../config/prisma';
import { NotFoundError } from '../../shared/errors/AppError';
import { calculateDistance } from '../../shared/utils/distance';

interface CreateLocationDTO {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  locationType: string;
  userId?: string;
}

interface UpdateLocationDTO {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  locationType?: string;
}

export class LocationService {
  async createLocation(data: CreateLocationDTO) {
    const location = await prisma.location.create({
      data,
    });

    return location;
  }

  async getLocations() {
    const locations = await prisma.location.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return locations;
  }

  async getLocationById(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundError('Location not found');
    }

    return location;
  }

  async updateLocation(id: string, data: UpdateLocationDTO) {
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundError('Location not found');
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data,
    });

    return updatedLocation;
  }

  async deleteLocation(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundError('Location not found');
    }

    await prisma.location.delete({
      where: { id },
    });

    return { message: 'Location deleted successfully' };
  }

  async calculateDistanceBetween(fromLocationId: string, toLocationId: string) {
    const [fromLocation, toLocation] = await Promise.all([
      this.getLocationById(fromLocationId),
      this.getLocationById(toLocationId),
    ]);

    const distance = calculateDistance(
      fromLocation.latitude,
      fromLocation.longitude,
      toLocation.latitude,
      toLocation.longitude
    );

    return {
      from: {
        id: fromLocation.id,
        name: fromLocation.name,
        coordinates: {
          latitude: fromLocation.latitude,
          longitude: fromLocation.longitude,
        },
      },
      to: {
        id: toLocation.id,
        name: toLocation.name,
        coordinates: {
          latitude: toLocation.latitude,
          longitude: toLocation.longitude,
        },
      },
      distanceKm: Math.round(distance * 100) / 100,
    };
  }
}
