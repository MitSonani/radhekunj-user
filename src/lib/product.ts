import { PublicImageItem, PublicVariant } from '@/types/api';

/** Format a money string like "999.00" to "₹999" */
export function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Calculate discount percentage from price and compareAtPrice strings.
 * Returns null if no valid discount.
 */
export function calcDiscountPct(price: string, compareAtPrice: string | null): number | null {
  if (!compareAtPrice) return null;
  const p = parseFloat(price);
  const c = parseFloat(compareAtPrice);
  if (isNaN(p) || isNaN(c) || c <= p) return null;
  return Math.round((1 - p / c) * 100);
}

/**
 * Returns the images to display in the gallery based on selected color attribute value.
 * Generic images (attributeValueId === null) are always shown.
 * Color-specific images for the selected color are appended.
 */
export function getGalleryImages(
  images: PublicImageItem[],
  selectedColorValueId: string | null,
): PublicImageItem[] {
  const generic = images.filter((img) => img.attributeValueId === null);
  if (!selectedColorValueId) return generic;
  const colorImages = images.filter((img) => img.attributeValueId === selectedColorValueId);
  return [...generic, ...colorImages];
}

/**
 * Finds the exact variant matching ALL selected attribute values.
 * Returns null if no complete match (e.g., not all attributes selected yet).
 */
export function findMatchingVariant(
  variants: PublicVariant[],
  selectedAttributes: Record<string, string>,
): PublicVariant | null {
  const selectedEntries = Object.entries(selectedAttributes);
  if (selectedEntries.length === 0) return null;

  return (
    variants.find((v) => {
      const variantMap = Object.fromEntries(
        v.attributes.map((a) => [a.attribute.id, a.attributeValue.id]),
      );
      return selectedEntries.every(([attrId, valueId]) => variantMap[attrId] === valueId);
    }) ?? null
  );
}

/**
 * Returns the set of attribute value IDs that are still compatible with the
 * other currently selected attributes. Used to mark options as unavailable.
 */
export function getAvailableValuesForAttribute(
  variants: PublicVariant[],
  attributeId: string,
  otherSelectedAttributes: Record<string, string>,
): Set<string> {
  const filtered = variants.filter((v) => {
    const variantMap = Object.fromEntries(
      v.attributes.map((a) => [a.attribute.id, a.attributeValue.id]),
    );
    return Object.entries(otherSelectedAttributes).every(
      ([aId, vId]) => variantMap[aId] === vId,
    );
  });

  return new Set(
    filtered
      .flatMap((v) => v.attributes)
      .filter((a) => a.attribute.id === attributeId)
      .map((a) => a.attributeValue.id),
  );
}
