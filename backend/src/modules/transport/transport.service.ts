import prisma from '../../config/prisma';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';
import { TRANSPORT_BUFFER_PERCENTAGE } from '../../config/constants';

interface CreateProviderDTO {
  name: string;
  userId: string;
}

interface CreateVehicleDTO {
  providerId: string;
  name: string;
  licensePlate: string;
  capacityKg: number;
  costPerKm: number;
}

interface VehicleAllocation {
  vehicleId: string;
  cost: number;
}

export class TransportService {

  async createProvider(data: CreateProviderDTO) {
    const provider = await prisma.transportProvider.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return provider;
  }

  async getProviders() {
    const providers = await prisma.transportProvider.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicles: {
          where: { status: 'AVAILABLE' },
        },
        _count: {
          select: { vehicles: true, jobs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return providers;
  }

  async getProviderById(id: string) {
    const provider = await prisma.transportProvider.findUnique({
      where: { id },
      include: {
        user: true,
        vehicles: true,
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!provider) {
      throw new NotFoundError('Transport provider not found');
    }

    return provider;
  }


  async createVehicle(data: CreateVehicleDTO) {
    const vehicle = await prisma.vehicle.create({
      data,
      include: {
        provider: true,
      },
    });

    return vehicle;
  }

  async getVehicles(providerId?: string, status?: string) {
    const where: any = {};
    if (providerId) where.providerId = providerId;
    if (status) where.status = status;

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return vehicles;
  }

  async getVehicleById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        provider: true,
        allocations: {
          include: {
            job: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    return vehicle;
  }

  async updateVehicle(id: string, data: Partial<CreateVehicleDTO & { status: string }>) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data,
      include: {
        provider: true,
      },
    });

    return updatedVehicle;
  }


  /**
   * Calculate optimal vehicle allocation and cost for a transport job
   * @param providerId Transport provider ID
   * @param totalWeight Total weight to transport (kg)
   * @param distanceKm Distance in kilometers
   * @returns Optimal vehicle allocation and total cost
   */
  async calculateTransportCost(
    providerId: string,
    totalWeight: number,
    distanceKm: number
  ) {
    if (totalWeight <= 0) {
      throw new BadRequestError('Total weight must be greater than 0');
    }

    if (distanceKm <= 0) {
      throw new BadRequestError('Distance must be greater than 0');
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        providerId,
        status: 'AVAILABLE',
      },
      orderBy: {
        costPerKm: 'asc',
      },
    });

    if (vehicles.length === 0) {
      throw new BadRequestError('No available vehicles for this provider');
    }

    const requiredWeight = totalWeight * (1 + TRANSPORT_BUFFER_PERCENTAGE);

    const allocation = this.findOptimalVehicleAllocation(
      vehicles,
      requiredWeight,
      distanceKm
    );

    if (!allocation) {
      throw new BadRequestError(
        'No suitable vehicle combination found for this weight'
      );
    }

    return allocation;
  }

  
  private findOptimalVehicleAllocation(
    vehicles: any[],
    requiredWeight: number,
    distanceKm: number
  ): { allocations: VehicleAllocation[]; totalCost: number } | null {
    for (const vehicle of vehicles) {
      if (vehicle.capacityKg >= requiredWeight) {
        const cost = vehicle.costPerKm * distanceKm;
        return {
          allocations: [
            {
              vehicleId: vehicle.id,
              cost: Math.round(cost * 100) / 100,
            },
          ],
          totalCost: Math.round(cost * 100) / 100,
        };
      }
    }

    let remainingWeight = requiredWeight;
    const allocations: VehicleAllocation[] = [];
    let totalCost = 0;

    const sortedVehicles = [...vehicles].sort(
      (a, b) => b.capacityKg - a.capacityKg
    );

    for (const vehicle of sortedVehicles) {
      if (remainingWeight <= 0) break;

      const cost = vehicle.costPerKm * distanceKm;
      allocations.push({
        vehicleId: vehicle.id,
        cost: Math.round(cost * 100) / 100,
      });

      totalCost += cost;
      remainingWeight -= vehicle.capacityKg;
    }

    if (remainingWeight > 0) {
      return null; 
    }

    return {
      allocations,
      totalCost: Math.round(totalCost * 100) / 100,
    };
  }


  async getTransportJobs(providerId?: string, status?: string) {
    const where: any = {};
    if (providerId) where.providerId = providerId;
    if (status) where.status = status;

    const jobs = await prisma.transportJob.findMany({
      where,
      include: {
        order: true,
        provider: true,
        fromLocation: true,
        toLocation: true,
        allocations: {
          include: {
            vehicle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jobs;
  }

  async getTransportJobById(id: string) {
    const job = await prisma.transportJob.findUnique({
      where: { id },
      include: {
        order: true,
        provider: true,
        fromLocation: true,
        toLocation: true,
        allocations: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Transport job not found');
    }

    return job;
  }

  async updateTransportJobStatus(id: string, status: string) {
    const job = await prisma.transportJob.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundError('Transport job not found');
    }

    const data: any = { status };

    if (status === 'COMPLETED') {
      data.completedDate = new Date();
    }

    const updatedJob = await prisma.transportJob.update({
      where: { id },
      data,
      include: {
        order: true,
        provider: true,
        allocations: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    return updatedJob;
  }
}
