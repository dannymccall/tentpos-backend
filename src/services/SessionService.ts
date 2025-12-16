import { Session } from "../models/Session.js";
import { SessionRepository } from "../repositories/SessionRepository.js";
import crypto from "crypto";
export class SessionService {
  private sessionRespository: SessionRepository;

  constructor() {
    this.sessionRespository = new SessionRepository();
  }


  public createSession = async (data: Partial<Session>) => {
    return await this.sessionRespository.createSession(data);
  };

  public static generateSessionIdWithSalt = (userId: number): string => {
    const randomPart = crypto.randomBytes(32).toString("hex");
    const timestamp = Date.now().toString();
    const base = userId + timestamp + randomPart;
    return crypto.createHash("sha256").update(base).digest("hex");
  };

  public deleteSession = async (id: number) => {
    return await this.sessionRespository.deleteSession(id);
  };

  public findSessionById = async (id:string) => {
    return await this.sessionRespository.findSessionById(id)
  }
}
