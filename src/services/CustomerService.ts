import { Customer } from "../models/Customer.js";
import customerRepository from "../repositories/CustomerRepository.js";

class CustomerService {
   async createCustomer(dto: any) {
    return customerRepository.createCustomer(dto);
  }

   async updateCustomer(id: number, dto: any) {
    return customerRepository.updateCustomer(id, dto);
  }

   async getCustomerById(id: number) {
    return customerRepository.getCustomerById(id);
  }

   async getAllCustomers(  page: number = 1,
    limit: number = 10,
    search: string = "",
    where: any = {}) {
    return customerRepository.getAllCustomers(page, limit, search, where);
  }

   async deleteCustomer(id: number) {
    return customerRepository.deleteCustomer(id);
  }

  public async bulkUpload(
      categories: Customer[],
      tenantId: string,
      branchId: number
    ) {
      // Attach tenantId and createdBy
      const records = categories.map((c) => ({
        ...c,
        tenantId,
        branchId,
      }));
  
      // Perform bulk insert (ignoring duplicates)
      return await customerRepository.bulkUpload(records as any)
    }

    public async fetchDebtors(page: number =1, limit: number =10, search: string ="",  baseWhere={}) {
      return await customerRepository.fetchDebtors(page, limit, search,  baseWhere);
    } 

}

export default new CustomerService()