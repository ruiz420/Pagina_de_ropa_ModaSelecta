"use client";

import { Pencil, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type RoleName = "ADMIN" | "EMPLOYEE" | "CUSTOMER";

type UserRow = {
  id: string;
  name: string;
  phone: string;
  city: string;
  role: RoleName;
};

export function UserRowActions({ user }: { user: UserRow }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState(user);

  async function saveUser() {
    setIsSaving(true);
    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        phone: draft.phone,
        city: draft.city,
        role: draft.role,
      }),
      credentials: "same-origin",
    });
    setIsSaving(false);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      toast.error(error?.message ?? "No se pudo actualizar el usuario");
      return;
    }

    toast.success("Usuario actualizado");
    setIsEditing(false);
    router.refresh();
  }

  async function deleteUser() {
    const confirmed = window.confirm("Deseas eliminar este usuario?");

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/users/${user.id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      toast.error(error?.message ?? "No se pudo eliminar el usuario");
      return;
    }

    toast.success("Usuario eliminado");
    router.refresh();
  }

  if (!isEditing) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
        <Button type="button" variant="destructive" onClick={deleteUser}>
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-2 md:grid-cols-2">
      <Input
        value={draft.name}
        placeholder="Nombre"
        onChange={(event) => setDraft({ ...draft, name: event.target.value })}
      />
      <Input
        value={draft.phone}
        placeholder="Telefono"
        onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
      />
      <Input
        value={draft.city}
        placeholder="Ciudad"
        onChange={(event) => setDraft({ ...draft, city: event.target.value })}
      />
      <Select
        value={draft.role}
        onChange={(event) =>
          setDraft({ ...draft, role: event.target.value as RoleName })
        }
      >
        <option value="CUSTOMER">Cliente</option>
        <option value="EMPLOYEE">Empleado</option>
        <option value="ADMIN">Admin</option>
      </Select>
      <div className="flex gap-2 md:col-span-2">
        <Button type="button" onClick={saveUser} disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
