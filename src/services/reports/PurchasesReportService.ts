import { Op } from "sequelize";
import { Purchase } from "../../models/Purchase.js";
import { PurchasesReportFilters } from "../../types.js";
import Supplier from "../../models/Supplier.js";

class PurchasesReportService {
  private buildFilter = (filters: PurchasesReportFilters) => {
    const { startDate, endDate, tenantId } = filters;

    const reportFilter: any = { tenantId };

    if (startDate || endDate) {
      reportFilter.createdAt = {};
      if (startDate)
        reportFilter.createdAt[Op.gte] = new Date(startDate).setHours(
          0,
          0,
          0,
          0,
        );
      if (endDate)
        reportFilter.createdAt[Op.lte] = new Date(endDate).setHours(
          23,
          59,
          59,
          999,
        );
    }

    return reportFilter;
  };

  public async getPurchasesReport(filters: PurchasesReportFilters) {
    const reportFilter = this.buildFilter(filters);

    const purchases = await Purchase.findAll({
      where: { ...reportFilter },
      include: [{ model: Supplier, as: "supplier" }],
    });

    return purchases;
  }
}

export default new PurchasesReportService();
