import { Request, Response, NextFunction } from 'express';
import { TransportService } from './transport.service';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess, sendCreated } from '../../shared/utils/response';

const transportService = new TransportService();

export const createProvider = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const provider = await transportService.createProvider(req.body);
    sendCreated(res, { provider }, 'Transport provider created successfully');
  }
);

export const getProviders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const providers = await transportService.getProviders();
    sendSuccess(res, { providers });
  }
);

export const getProviderById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const provider = await transportService.getProviderById(req.params.id);
    sendSuccess(res, { provider });
  }
);

export const createVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const vehicle = await transportService.createVehicle(req.body);
    sendCreated(res, { vehicle }, 'Vehicle created successfully');
  }
);

export const getVehicles = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.query.providerId as string | undefined;
    const status = req.query.status as string | undefined;

    const vehicles = await transportService.getVehicles(providerId, status);
    sendSuccess(res, { vehicles });
  }
);

export const getVehicleById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const vehicle = await transportService.getVehicleById(req.params.id);
    sendSuccess(res, { vehicle });
  }
);

export const updateVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const vehicle = await transportService.updateVehicle(req.params.id, req.body);
    sendSuccess(res, { vehicle }, 'Vehicle updated successfully');
  }
);

export const calculateTransportCost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { providerId, totalWeight, distanceKm } = req.body;

    const result = await transportService.calculateTransportCost(
      providerId,
      parseFloat(totalWeight),
      parseFloat(distanceKm)
    );

    sendSuccess(res, result);
  }
);

export const getTransportJobs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.query.providerId as string | undefined;
    const status = req.query.status as string | undefined;

    const jobs = await transportService.getTransportJobs(providerId, status);
    sendSuccess(res, { jobs });
  }
);

export const getTransportJobById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const job = await transportService.getTransportJobById(req.params.id);
    sendSuccess(res, { job });
  }
);

export const updateTransportJobStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const job = await transportService.updateTransportJobStatus(
      req.params.id,
      status
    );
    sendSuccess(res, { job }, 'Transport job status updated successfully');
  }
);
