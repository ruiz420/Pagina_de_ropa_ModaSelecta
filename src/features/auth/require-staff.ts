import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth-options";

const STAFF_ROLES = ["ADMIN", "EMPLOYEE"];

/** Sesion del personal (administrador o empleado), o null si no hay o no corresponde. */
export async function getStaffSession() {
  const session = await getServerSession(authOptions);

  return STAFF_ROLES.includes(session?.user.role ?? "") ? session : null;
}
