"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const roles = {
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
  CUSTOMER: "CUSTOMER",
} as const;

export function UserForm() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function createUser(formData: FormData) {
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      city: String(formData.get("city") ?? ""),
      role: String(formData.get("role") ?? roles.CUSTOMER),
    };

    setIsSaving(true);
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "same-origin",
    });
    setIsSaving(false);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      toast.error(error?.message ?? "No se pudo crear el usuario");
      return;
    }

    toast.success("Usuario creado");
    router.refresh();
  }

  return (
    <form action={createUser} className="grid gap-3 md:grid-cols-3">
      <Input name="name" placeholder="Nombre" required />
      <Input name="email" type="email" placeholder="Correo" required />
      <Input name="password" type="password" placeholder="Clave temporal" required />
      <Input name="phone" placeholder="Telefono" />
      <Input name="city" placeholder="Ciudad" />
      <Select name="role" defaultValue={roles.CUSTOMER}>
        <option value={roles.CUSTOMER}>Cliente</option>
        <option value={roles.EMPLOYEE}>Empleado</option>
        <option value={roles.ADMIN}>Admin</option>
      </Select>
      <Button type="submit" disabled={isSaving} className="md:col-span-3">
        {isSaving ? "Creando..." : "Crear usuario"}
      </Button>
    </form>
  );
}
