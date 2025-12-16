import Supplier from "../models/Supplier.js";
import { SupplierRepostiory } from "../repositories/SupplierRepository.js";
class SupplierService {
private supplierRepo: SupplierRepostiory;

constructor(){
    this.supplierRepo = new SupplierRepostiory()
}
  public async create(payload: any) {
    // sanitize / cast
    if (payload.openingBalance) payload.openingBalance = Number(payload.openingBalance);
    return this.supplierRepo.create(payload);
  }

  public async list( page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {}) {
    return this.supplierRepo.findAll(page, limit, search, baseWhere);
  }

  public async get(id: number) {
    return this.supplierRepo.findById(id);
  }

  public async update(id: number, payload: any) {
    if (payload.openingBalance) payload.openingBalance = Number(payload.openingBalance);
    return this.supplierRepo.update(id, payload);
  }

  public async remove(id: number) {
    return this.supplierRepo.delete(id);
  }
   public bulkUpload = async (suppliers: Supplier[], tenantId:string) => {
        return await this.supplierRepo.bulkUpload(suppliers, tenantId)
      }
}

export default new SupplierService();
