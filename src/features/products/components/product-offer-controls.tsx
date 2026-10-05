"use client";

import Image from "next/image";
import {
  EyeOff,
  Percent,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Status = "ACTIVE" | "HIDDEN" | "OUT_OF_STOCK";

type Option = {
  id: string;
  name: string;
};

type ProductEditorProduct = {
  id: string;
  name: string;
  reference: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  stock: number;
  status: Status;
  categoryId: string;
  tags: string[];
  images: string[];
  colors: string[];
  sizes: string[];
};

type NumberValue = number | "";

export function ProductOfferControls({
  product,
  categories,
  colors,
  sizes,
}: {
  product: ProductEditorProduct;
  categories: Option[];
  colors: Option[];
  sizes: Option[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [availableColors, setAvailableColors] = useState(colors);
  const [availableSizes, setAvailableSizes] = useState(sizes);
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const [discountPercent, setDiscountPercent] = useState<NumberValue>(20);
  const [draft, setDraft] = useState({
    ...product,
    compareAtPrice: product.compareAtPrice ?? ("" as NumberValue),
    cost: product.cost ?? ("" as NumberValue),
    tagsText: product.tags.join(", "),
    imagesText: product.images.join("\n"),
  });

  function patchDraft(
    values: Partial<typeof draft> | ((current: typeof draft) => typeof draft),
  ) {
    setDraft((current) =>
      typeof values === "function" ? values(current) : { ...current, ...values },
    );
  }

  function numberFromValue(value: string): NumberValue {
    return value === "" ? "" : Number(value);
  }

  function toggleColor(color: string) {
    patchDraft((current) => ({
      ...current,
      colors: current.colors.includes(color)
        ? current.colors.filter((item) => item !== color)
        : [...current.colors, color],
    }));
  }

  function toggleSize(size: string) {
    patchDraft((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((item) => item !== size)
        : [...current.sizes, size],
    }));
  }

  function updateImages(urls: string[]) {
    patchDraft((current) => ({
      ...current,
      images: urls,
      imagesText: urls.join("\n"),
    }));
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
    updateImages([...draft.images, ...payload.urls]);
    toast.success("Imagenes cargadas");
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

    const color = (await response.json()) as Option;
    setAvailableColors((items) =>
      [...items, color].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setNewColor("");
    if (!draft.colors.includes(color.name)) {
      patchDraft({ colors: [...draft.colors, color.name] });
    }
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

    const size = (await response.json()) as Option;
    setAvailableSizes((items) => [...items, size]);
    setNewSize("");
    if (!draft.sizes.includes(size.name)) {
      patchDraft({ sizes: [...draft.sizes, size.name] });
    }
    toast.success("Talla creada");
  }

  function calculateDiscount() {
    const percent = Number(discountPercent);
    if (!percent || percent < 1 || percent > 90) {
      toast.error("El descuento debe estar entre 1% y 90%");
      return;
    }

    const originalPrice =
      Number(draft.compareAtPrice) > Number(draft.price)
        ? Number(draft.compareAtPrice)
        : Number(draft.price);
    const offerPrice = Math.round(originalPrice * (1 - percent / 100));

    patchDraft({
      compareAtPrice: originalPrice,
      price: offerPrice,
    });
  }

  function clearOffer() {
    patchDraft((current) => ({
      ...current,
      price:
        Number(current.compareAtPrice) > Number(current.price)
          ? Number(current.compareAtPrice)
          : current.price,
      compareAtPrice: "",
    }));
  }

  async function saveProduct(nextStatus?: Status) {
    const payload = {
      name: draft.name,
      reference: draft.reference,
      price: draft.price,
      compareAtPrice: draft.compareAtPrice === "" ? undefined : draft.compareAtPrice,
      cost: draft.cost === "" ? undefined : draft.cost,
      description: draft.description,
      categoryId: draft.categoryId,
      stock: draft.stock,
      colors: draft.colors,
      sizes: draft.sizes,
      images: draft.images,
      tags: draft.tagsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      status: nextStatus ?? draft.status,
    };

    setIsSaving(true);
    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "same-origin",
    });
    setIsSaving(false);

    if (!response.ok) {
      if (response.status === 401) {
        toast.error("Tu sesion vencio. Inicia sesion otra vez para guardar.");
        router.push("/login?callbackUrl=/admin/productos");
        return;
      }

      const error = await response.json().catch(() => null);
      toast.error(error?.message ?? "No se pudo actualizar el producto");
      return;
    }

    toast.success("Producto actualizado");
    router.refresh();
  }

  async function deleteProduct() {
    const confirmed = window.confirm(
      "Esta accion elimina el producto. Usala solo si ya no existe. Deseas continuar?",
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/products/${product.id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });

    if (!response.ok) {
      if (response.status === 401) {
        toast.error("Tu sesion vencio. Inicia sesion otra vez para eliminar.");
        router.push("/login?callbackUrl=/admin/productos");
        return;
      }

      const error = await response.json().catch(() => null);
      toast.error(error?.message ?? "No se pudo eliminar el producto");
      return;
    }

    toast.success("Producto eliminado");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsEditing((value) => !value)}
      >
        <Pencil className="h-4 w-4" />
        Editar
      </Button>
      {isEditing ? (
        <div className="space-y-4 rounded-md border bg-muted/40 p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Nombre
              <Input
                value={draft.name}
                onChange={(event) => patchDraft({ name: event.target.value })}
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Referencia
              <Input
                value={draft.reference}
                onChange={(event) =>
                  patchDraft({ reference: event.target.value })
                }
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Categoria
              <Select
                value={draft.categoryId}
                onChange={(event) =>
                  patchDraft({ categoryId: event.target.value })
                }
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Estado de la prenda
              <Select
                value={draft.status}
                onChange={(event) =>
                  patchDraft({ status: event.target.value as Status })
                }
              >
                <option value="ACTIVE">Activo</option>
                <option value="HIDDEN">Oculto</option>
                <option value="OUT_OF_STOCK">Agotado</option>
              </Select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Precio de venta
              <Input
                type="number"
                min="0"
                value={draft.price}
                onChange={(event) =>
                  patchDraft({ price: Number(event.target.value) })
                }
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Precio antes de oferta
              <Input
                type="number"
                min="0"
                value={draft.compareAtPrice}
                onChange={(event) =>
                  patchDraft({
                    compareAtPrice: numberFromValue(event.target.value),
                  })
                }
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Precio de compra solo admin
              <Input
                type="number"
                min="0"
                value={draft.cost}
                onChange={(event) =>
                  patchDraft({ cost: numberFromValue(event.target.value) })
                }
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Stock interno
              <Input
                type="number"
                min="0"
                value={draft.stock}
                onChange={(event) =>
                  patchDraft({ stock: Number(event.target.value) })
                }
              />
            </label>
          </div>

          <Textarea
            value={draft.description}
            placeholder="Descripcion del producto"
            onChange={(event) =>
              patchDraft({ description: event.target.value })
            }
          />

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-3 rounded-md border bg-background p-3">
              <p className="text-sm font-medium">Colores disponibles</p>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <Button
                    key={color.id}
                    type="button"
                    size="sm"
                    variant={
                      draft.colors.includes(color.name) ? "default" : "outline"
                    }
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

            <div className="space-y-3 rounded-md border bg-background p-3">
              <p className="text-sm font-medium">Tallas disponibles</p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <Button
                    key={size.id}
                    type="button"
                    size="sm"
                    variant={
                      draft.sizes.includes(size.name) ? "default" : "outline"
                    }
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
          </div>

          <div className="space-y-3 rounded-md border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Imagenes o adjuntos</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
                <Upload className="h-4 w-4" />
                Cargar imagenes
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploadingImages}
                  onChange={(event) => {
                    uploadImages(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
            {isUploadingImages ? (
              <p className="text-xs text-muted-foreground">
                Subiendo imagenes...
              </p>
            ) : null}
            <Textarea
              value={draft.imagesText}
              placeholder="Tambien puedes pegar una URL publica por linea"
              onChange={(event) => {
                const urls = event.target.value
                  .split(/\r?\n/)
                  .map((item) => item.trim())
                  .filter(Boolean);
                patchDraft({
                  images: urls,
                  imagesText: event.target.value,
                });
              }}
            />
            {draft.images.length ? (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {draft.images.map((url) => (
                  <div
                    key={url}
                    className="grid grid-cols-[64px_1fr_auto] items-center gap-2 rounded-md border bg-muted p-2"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-md bg-background">
                      <Image
                        src={url}
                        alt={draft.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {url}
                    </p>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Eliminar imagen"
                      onClick={() =>
                        updateImages(draft.images.filter((item) => item !== url))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Etiquetas separadas por coma
            <Input
              value={draft.tagsText}
              onChange={(event) => patchDraft({ tagsText: event.target.value })}
            />
          </label>

          <div className="grid gap-2 rounded-md border bg-background p-3 sm:grid-cols-[1fr_auto_auto]">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Descuento rapido %
              <Input
                type="number"
                min="1"
                max="90"
                value={discountPercent}
                onChange={(event) =>
                  setDiscountPercent(numberFromValue(event.target.value))
                }
              />
            </label>
            <Button
              type="button"
              variant="outline"
              className="self-end"
              onClick={calculateDiscount}
            >
              <Percent className="h-4 w-4" />
              Calcular %
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="self-end"
              onClick={clearOffer}
            >
              <RotateCcw className="h-4 w-4" />
              Quitar oferta
            </Button>
          </div>

          <div className="grid gap-2 border-t pt-3 sm:grid-cols-3">
            <Button
              type="button"
              onClick={() => saveProduct()}
              disabled={isSaving || isUploadingImages}
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => saveProduct("HIDDEN")}
              disabled={isSaving}
            >
              <EyeOff className="h-4 w-4" />
              Ocultar
            </Button>
            <Button type="button" variant="destructive" onClick={deleteProduct}>
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
