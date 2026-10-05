"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  categorySchema,
  type CategoryFormValues,
} from "@/features/categories/schemas/category.schema";

export function CategoryForm() {
  const router = useRouter();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      order: 0,
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      toast.error(error?.message ?? "No se pudo guardar la categoria");
      return;
    }

    toast.success("Categoria creada");
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <Input placeholder="Nombre" {...form.register("name")} />
      <Input placeholder="Orden" type="number" {...form.register("order")} />
      <Input placeholder="Icono Lucide o etiqueta" {...form.register("icon")} />
      <Input placeholder="URL de imagen" {...form.register("imageUrl")} />
      <Textarea
        className="md:col-span-2"
        placeholder="Descripcion"
        {...form.register("description")}
      />
      <Button type="submit" className="md:col-span-2">
        Crear categoria
      </Button>
    </form>
  );
}
