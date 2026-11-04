import { adminAc, defaultAc } from "better-auth/plugins/admin/access";

/**
 * Marketplace roles shared by the Better Auth server and browser client.
 *
 * The admin plugin ships `admin` and `user` by default. Defining the app's
 * `owner` and `renter` roles here makes `setRole` accept them (and keeps the
 * client types honest) while only `admin` keeps the management permissions.
 */
const noAdminAccess = { user: [], session: [] };

export const authRoles = {
  admin: adminAc,
  owner: defaultAc.newRole(noAdminAccess),
  renter: defaultAc.newRole(noAdminAccess),
};
