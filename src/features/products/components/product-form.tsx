"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  productSchema,
  type ProductFormValues,
} from "@/features/products/schemas/product.schema";

type CategoryOption = {
  id: string;
  name: string;
};

type AttributeOption = {
  id: string;
  name: string;
};

export function ProductForm({
  categories,
  colors,
  sizes,
}: {
  categories: CategoryOption[];
  colors: AttributeOption[];
  sizes: AttributeOption[];
}) {
  const router = useRouter();
  const [availableColors, setAvailableColors] = useState(colors);
  const [availableSizes, setAvailableSizes] = useState(sizes);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      reference: "",
      price: 0,
      compareAtPrice: undefined,
      cost: undefined,
      description: "",
      categoryId: categories[0]?.id ?? "",
      stock: 0,
      colors: [],
      sizes: [],
      images: [],
      tags: [],
      status: "ACTIVE",
    },
  });

  async function onSubmit(values: ProductFormValues) {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      credentials: "same-origin",
    });

    if (!response.ok) {
      if (response.status === 401) {
        toast.error("Tu sesion vencio. Inicia sesion otra vez para crear productos.");
        router.push("/login?callbackUrl=/admin/productos");
        return;
      }

      const error = await response.json().catch(() => null);
      toast.error(error?.message ?? "No se pudo guardar el producto");
      return;
    }

    toast.success("Producto creado");
    form.reset();
    setSelectedColors([]);
    setSelectedSizes([]);
    setImageUrls([]);
    router.refresh();
  }

  function onInvalid(errors: FieldErrors<ProductFormValues>) {
    const firstError = Object.keys(errors)[0];
    toast.error(
      firstError
        ? `Revisa el campo: ${firstError}`
        : "Revisa los campos obligatorios",
    );
  }

  function toggleColor(color: string) {
    const nextColors = selectedColors.includes(color)
      ? selectedColors.filter((item) => item !== color)
      : [...selectedColors, color];

    setSelectedColors(nextColors);
    form.setValue("colors", nextColors, { shouldValidate: true });
  }

  function toggleSize(size: string) {
    const nextSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((item) => item !== size)
      : [...selectedSizes, size];

    setSelectedSizes(nextSizes);
    form.setValue("sizes", nextSizes, { shouldValidate: true });
  }

  async function createColor() {
    const name = newColor.trim();
    if (!name) {
      return;
    }

    const response = await fetch("/api/colors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
      credentials: "same-origin",
    });

    if (!response.ok) {
      if (response.status === 401) {
        toast.error("Tu sesion vencio. Inicia sesion otra vez para crear colores.");
        router.push("/login?callbackUrl=/admin/productos");
        return;
      }

      const error = await response.json().catch(() => null);
      toast.error(error?.message ?? "No se pudo crear el color");
      return;
    }

    const color = (await response.json()) as AttributeOption;
    setAvailableColors((items) => [...items, color].sort((a, b) => a.name.localeCompare(b.name)));
    setNewColor("");
    toggleColor(color.name);
    toast.success("Color creado");
  }

  async function createSize() {
    const name = newSize.trim();
    if (!name) {
      return;
    }

    const response = await fetch("/api/sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, order: availableSizes.length }),
      credentials: "same-origin",
    });

    if (!response.ok) {
      if (response.status === 401) {
        toast.error("Tu sesion vencio. Inicia sesion otra vez para crear tallas.");
        router.push("/login?callbackUrl=/admin/productos");
        return;
      }

      const error = await response.json().catch(() => null);
      toast.error(error?.message ?? "No se pudo crear la talla");
      return;
    }

    const size = (await response.json()) as AttributeOption;
    setAvailableSizes((items) => [...items, size]);
    setNewSize("");
    toggleSize(size.name);
    toast.success("Talla creada");
  }

  function updateImages(urls: string[]) {
    setImageUrls(urls);
    form.setValue("images", urls, { shouldValidate: true });
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    setIsUploadingImages(true);
    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });
    setIsUploadingImages(false);

    if (!response.ok) {
      if (response.status === 401) {
        toast.error("Tu sesion vencio. Inicia sesion otra vez para subir imagenes.");
        router.push("/login?callbackUrl=/admin/productos");
        return;
      }

      const error = await response.json().catch(() => null);
      toast.error(error?.message ?? "No se pudieron subir las imagenes");
      return;
    }

    const payload = (await response.json()) as { urls: string[] };
    updateImages([...imageUrls, ...payload.urls]);
    toast.success("Imagenes cargadas");
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      className="grid gap-4 md:grid-cols-2"
    >
      <label className="space-y-2 text-sm font-medium">
        Nombre
        <Input placeholder="Body manga larga" {...form.register("name")} />
      </label>
      <label className="space-y-2 text-sm font-medium">
        Referencia
        <Input placeholder="REF-001" {...form.register("reference")} />
      </label>
      <label className="space-y-2 text-sm font-medium">
        Precio de venta
        <Input placeholder="Precio de venta" type="number" min="0" {...form.register("price")} />
      </label>
      <label className="space-y-2 text-sm font-medium">
        Precio antes de oferta
        <Input
          placeholder="Ej: 99000"
          type="number"
          min="0"
          {...form.register("compareAtPrice")}
        />
      </label>
      <label className="space-y-2 text-sm font-medium">
        Precio de compra solo admin
        <Input placeholder="Costo interno" type="number" min="0" {...form.register("cost")} />
      </label>
      <label className="space-y-2 text-sm font-medium">
        Stock
        <Input placeholder="Cantidad disponible" type="number" min="0" {...form.register("stock")} />
      </label>
      <label className="space-y-2 text-sm font-medium">
        Categoria
        <Select {...form.register("categoryId")}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="space-y-2 text-sm font-medium">
        Estado
        <Select {...form.register("status")}>
          <option value="ACTIVE">Activo</option>
          <option value="HIDDEN">Oculto</option>
          <option value="OUT_OF_STOCK">Agotado</option>
        </Select>
      </label>
      <Textarea
        className="md:col-span-2"
        placeholder="Descripcion minimo 10 caracteres"
        {...form.register("description")}
      />
      <label className="space-y-2 text-sm font-medium md:col-span-2">
        Imagenes del producto
        <Input
          type="file"
          accept="image/*"
          multiple
          disabled={isUploadingImages}
          onChange={(event) => uploadImages(event.target.files)}
        />
        {isUploadingImages ? (
          <p className="text-xs text-muted-foreground">Subiendo imagenes...</p>
        ) : null}
        <Textarea
          value={imageUrls.join("\n")}
          placeholder="O pega una URL publica por linea"
          onChange={(event) =>
            updateImages(
              event.target.value
                .split(/\r?\n/)
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
        />
        {imageUrls.length ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {imageUrls.map((url) => (
              <div key={url} className="rounded-md border bg-muted p-2 text-xs">
                <p className="truncate text-muted-foreground">{url}</p>
              </div>
            ))}
          </div>
        ) : null}
      </label>
      <div className="space-y-3 rounded-md border p-3">
        <p className="text-sm font-medium">Colores fijos</p>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => (
            <Button
              key={color.id}
              type="button"
              size="sm"
              variant={selectedColors.includes(color.name) ? "default" : "outline"}
              onClick={() => toggleColor(color.name)}
            >
              {color.name}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nuevo color"
            value={newColor}
            onChange={(event) => setNewColor(event.target.value)}
          />
          <Button type="button" variant="outline" onClick={createColor}>
            Crear
          </Button>
        </div>
      </div>
      <div className="space-y-3 rounded-md border p-3">
        <p className="text-sm font-medium">Tallas fijas</p>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <Button
              key={size.id}
              type="button"
              size="sm"
              variant={selectedSizes.includes(size.name) ? "default" : "outline"}
              onClick={() => toggleSize(size.name)}
            >
              {size.name}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nueva talla"
            value={newSize}
            onChange={(event) => setNewSize(event.target.value)}
          />
          <Button type="button" variant="outline" onClick={createSize}>
            Crear
          </Button>
        </div>
      </div>
      <Input
        className="md:col-span-2"
        placeholder="Etiquetas separadas por coma"
        onChange={(event) =>
          form.setValue(
            "tags",
            event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
          )
        }
      />
      <Button type="submit" className="md:col-span-2">
        Crear producto
      </Button>
    </form>
  );
}
