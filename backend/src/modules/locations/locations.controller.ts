import { Request, Response, NextFunction } from 'express';
import { LocationService } from './locations.service';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess, sendCreated } from '../../shared/utils/response';

const locationService = new LocationService();

export const createLocation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const location = await locationService.createLocation(req.body);
    sendCreated(res, { location }, 'Location created successfully');
  }
);

export const getLocations = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const locations = await locationService.getLocations();
    sendSuccess(res, { locations });
  }
);

export const getLocationById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const location = await locationService.getLocationById(req.params.id);
    sendSuccess(res, { location });
  }
);

export const updateLocation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const location = await locationService.updateLocation(req.params.id, req.body);
    sendSuccess(res, { location }, 'Location updated successfully');
  }
);

export const deleteLocation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await locationService.deleteLocation(req.params.id);
    sendSuccess(res, result);
  }
);

export const calculateDistance = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fromLocationId, toLocationId } = req.query;
    
    const result = await locationService.calculateDistanceBetween(
      fromLocationId as string,
      toLocationId as string
    );
    
    sendSuccess(res, result);
  }
);
