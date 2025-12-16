// src/core/CRUDService.ts
import { FindOptions, Model, ModelStatic, WhereOptions } from "sequelize";

export class CRUDService<T extends Model> {
  constructor(private model: ModelStatic<T>) {}

  async create(data: Partial<T["_creationAttributes"]> | any): Promise<T> {
    return await this.model.create(data);
  }

  async findAll(): Promise<T[]> {
    return await this.model.findAll();
  }

  async findById(id: number): Promise<T | null> {
    return await this.model.findByPk(id);
  }

  async update(id: number, data: Partial<T["_attributes"]>): Promise<T | null> {
    const record = await this.findById(id);
    if (!record) return null;
    await record.update(data);
    return record;
  }

  async delete(id: number): Promise<boolean> {
    const record = await this.findById(id);
    if (!record) return false;
    await record.destroy();
    return true;
  }

  async findByField<K extends keyof T["_attributes"]>(
    field: K,
    value: T["_attributes"][K]
  ): Promise<T | null> {
    const whereClause: WhereOptions<T["_attributes"]> = {
      [field]: value,
    } as any;

    return await this.model.findOne({ where: whereClause });
  }

  async findAllByField<K extends keyof T["_attributes"]>(
    field: K,
    value: T["_attributes"][K]
  ): Promise<T[]> {
    const whereClause: WhereOptions<T["_attributes"]> = {
      [field]: value,
    } as any;

    return await this.model.findAll({ where: whereClause });
  }

async findByConditions(
  options: {
    where: Partial<T["_attributes"]>;
  } & Omit<FindOptions<T["_attributes"]>, "where">
): Promise<T[]> {
  return await this.model.findAll({
    ...options,
    where: options.where as WhereOptions<T["_attributes"]>,
  });
}


  async findAllByConditions(
    conditions: Partial<T["_attributes"]>
  ): Promise<T[]> {
    return await this.model.findAll({
      where: conditions as WhereOptions<T["_attributes"]>,
    });
  }
}
