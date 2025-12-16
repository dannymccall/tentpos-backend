// repositories/SessionRepository.ts
import { CRUDService } from "../core/CRUDService.js";
import { Op } from "sequelize";
import { Session } from "../models/Session.js";


export class SessionRepository extends CRUDService<Session> {
  constructor() {
    super(Session);
  }

  public createSession = async (data: Partial<Session>) => {
    return await this.create(data);
  };

  public findSessionById = async (id: string) => {
    const session = await Session.findOne({
      where: {
        sessionId: id,
      },
     
    });

    return session;
  };

  public deleteSession = async (id: number) => {
    return await this.delete(id);
  };
  

  public findActiveByUserId = async (email: string) => {
    return await Session.findAll({
      where: {
        email,
      },
    });
  };
}
