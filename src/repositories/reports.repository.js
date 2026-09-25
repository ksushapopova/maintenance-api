import { QueryTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

export const reportsRepository = {

  async equipmentLoad({ from, to, minRequests }) {
    const sql = `
      SELECT
        e.id                                          AS "equipmentId",
        e.name                                        AS "equipmentName",
        e.type                                        AS "equipmentType",
        e.serial_number                               AS "serialNumber",
        s.id                                          AS "siteId",
        s.code                                        AS "siteCode",
        COUNT(r.id)                                   AS "totalRequests",
        COUNT(r.id) FILTER (WHERE r.status = 'done')  AS "closedRequests",
        COALESCE(SUM(ra.hours), 0)                    AS "totalHours",
        MAX(r.updated_at) FILTER (WHERE r.status = 'done') AS "lastCompletedAt"
      FROM equipment e
      JOIN sites s ON s.id = e.site_id
      LEFT JOIN maintenance_requests r
             ON r.equipment_id = e.id
            AND (:from IS NULL OR r.created_at >= :from)
            AND (:to   IS NULL OR r.created_at <= :to)
      LEFT JOIN request_assignees ra ON ra.request_id = r.id
      GROUP BY e.id, e.name, e.type, e.serial_number, s.id, s.code
      HAVING COUNT(r.id) >= :minRequests
      ORDER BY "totalRequests" DESC, "totalHours" DESC
    `;

    return sequelize.query(sql, {
      replacements: {
        from: from ?? null,
        to: to ?? null,
        minRequests: minRequests ?? 0,
      },
      type: QueryTypes.SELECT,
    });
  },

  async siteSummary(siteId) {
    const byStatusSql = `
      SELECT r.status, COUNT(*) AS count
      FROM maintenance_requests r
      JOIN equipment e ON e.id = r.equipment_id
      WHERE e.site_id = :siteId
      GROUP BY r.status
      ORDER BY r.status
    `;

    const byPrioritySql = `
      SELECT r.priority, COUNT(*) AS count
      FROM maintenance_requests r
      JOIN equipment e ON e.id = r.equipment_id
      WHERE e.site_id = :siteId
      GROUP BY r.priority
      ORDER BY r.priority
    `;

    const avgCloseSql = `
      SELECT
        COALESCE(
          AVG(EXTRACT(EPOCH FROM (h.changed_at - r.created_at)) / 3600.0),
          0
        ) AS "avgHours"
      FROM maintenance_requests r
      JOIN equipment e ON e.id = r.equipment_id
      JOIN request_status_history h
        ON h.request_id = r.id AND h.to_status = 'done'
      WHERE e.site_id = :siteId
    `;

    const [byStatus, byPriority, avgClose] = await Promise.all([
      sequelize.query(byStatusSql, {
        replacements: { siteId },
        type: QueryTypes.SELECT,
      }),
      sequelize.query(byPrioritySql, {
        replacements: { siteId },
        type: QueryTypes.SELECT,
      }),
      sequelize.query(avgCloseSql, {
        replacements: { siteId },
        type: QueryTypes.SELECT,
      }),
    ]);

    const toMap = (rows) =>
      rows.reduce((acc, row) => {
        acc[row.status ?? row.priority] = Number(row.count);
        return acc;
      }, {});

    return {
      byStatus: toMap(byStatus),
      byPriority: toMap(byPriority),
      avgCloseHours: Number(avgClose[0]?.avgHours ?? 0),
    };
  },
};