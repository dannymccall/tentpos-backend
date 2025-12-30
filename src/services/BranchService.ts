import { BranchRepository } from "../repositories/BranchRepsitory.js";
import { Branch } from "../models/Branch.js";
import { PaginatedResponse } from "../types.js";

export class BranchService {
  private branchRepo: BranchRepository;

  constructor() {
    this.branchRepo = new BranchRepository();
  }

  public addBranch = async (
    data: Partial<Branch>
  ): Promise<Partial<Branch>> => {
    return await this.branchRepo.addBranch(data);
  };

  public getBranches = async (
    page: number = 1,
    limit: number = 10,
    search:string = "",
    baseWhere: any = {}
  ): Promise<PaginatedResponse<Branch> | Branch[]> => {
    return this.branchRepo.getBranches(page, limit,search, baseWhere);
  };

  public getBranch = async (id: number): Promise<Branch | null> => {
    return await this.branchRepo.getBranch(id);
  };

  public updateBranch = async (
    id: number,
    data: Partial<Branch>
  ): Promise<Partial<Branch> | null> => {
    return await this.branchRepo.updateRole(id, data);
  };
}
