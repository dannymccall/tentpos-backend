import { Request, Response, NextFunction } from 'express';

export function servicesInjector(services: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any).services = services;
    // console.log("from service injector: ", {req})
    next();
  };
}
