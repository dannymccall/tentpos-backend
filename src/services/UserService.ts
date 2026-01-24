import { User } from "../models/User.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { PaginatedResponse } from "../types.js";

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  public getUsers = async (
    page: number = 1,
    limit: number = 10,
    baseWhere: any = {},
    search: string = ""
  ): Promise<PaginatedResponse<User> | User[]> => {
    return await this.userRepo.getUsers(page, limit,  baseWhere, search);
  };

  public updateUser = async (
    id: number,
    data: Partial<User>
  ): Promise<User | null> => {
    return await this.userRepo.updateUser(id, data);
  };

  public getUser = async (id: number): Promise<User | null> => {
    return await this.userRepo.getUser(id);
  };

  public getUserBusinessProfile = async (
    email: string,
    appRole: string,
    tenantId: string
  ) => {
    return await this.userRepo.getUserBusinessProfile(email, appRole, tenantId);
  };

  public getUserDetails = async (staffid: number, tenantId: string) => {
    return await this.userRepo.getUserDetails(staffid, tenantId);
  };
}
