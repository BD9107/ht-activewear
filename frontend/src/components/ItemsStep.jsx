import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Trash2 } from "lucide-react";

const GARMENT_TYPES = ["T-Shirt", "Hoodie", "Polo", "Tank", "Jersey", "Other"];
const COLORS = ["White", "Black", "Navy", "Red", "Royal", "Grey", "Custom"];
const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const ItemsStep = ({ items, setItems }) => {
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const updateSize = (itemIndex, size, delta) => {
    const newItems = [...items];
    const currentQty = newItems[itemIndex].sizes[size];
    const newQty = Math.max(0, Math.min(999, currentQty + delta));
    newItems[itemIndex].sizes[size] = newQty;
    setItems(newItems);
  };

  const addItem = () => {
    const newLineNumber = items.length + 1;
    setItems([
      ...items,
      {
        lineNumber: newLineNumber,
        garmentType: "",
        otherGarment: "",
        color: "",
        customColor: "",
        sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, "2XL": 0, "3XL": 0 },
        notes: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return; // Keep at least one item
    const newItems = items.filter((_, i) => i !== index);
    // Renumber line numbers
    newItems.forEach((item, i) => {
      item.lineNumber = i + 1;
    });
    setItems(newItems);
  };

  const getItemTotal = (item) => {
    return Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
  };

  return (
    <div className="space-y-6" data-testid="items-step">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5"
          data-testid={`item-card-${index}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900" data-testid={`item-title-${index}`}>
              Item #{item.lineNumber}
            </h3>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                data-testid={`remove-item-${index}`}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Garment Type */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-900">
              Garment Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={item.garmentType}
              onValueChange={(value) => updateItem(index, 'garmentType', value)}
            >
              <SelectTrigger className="h-12 text-base rounded-xl" data-testid={`garment-type-select-${index}`}>
                <SelectValue placeholder="Select garment type" />
              </SelectTrigger>
              <SelectContent>
                {GARMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="text-base">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Other Garment */}
          {item.garmentType === "Other" && (
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900">
                Specify Garment <span className="text-red-500">*</span>
              </Label>
              <Input
                value={item.otherGarment}
                onChange={(e) => updateItem(index, 'otherGarment', e.target.value)}
                placeholder="Enter garment type"
                className="h-12 text-base rounded-xl"
                data-testid={`other-garment-input-${index}`}
              />
            </div>
          )}

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-900">
              Color <span className="text-red-500">*</span>
            </Label>
            <Select
              value={item.color}
              onValueChange={(value) => updateItem(index, 'color', value)}
            >
              <SelectTrigger className="h-12 text-base rounded-xl" data-testid={`color-select-${index}`}>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {COLORS.map((color) => (
                  <SelectItem key={color} value={color} className="text-base">
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Color */}
          {item.color === "Custom" && (
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900">
                Specify Color <span className="text-red-500">*</span>
              </Label>
              <Input
                value={item.customColor}
                onChange={(e) => updateItem(index, 'customColor', e.target.value)}
                placeholder="Enter custom color"
                className="h-12 text-base rounded-xl"
                data-testid={`custom-color-input-${index}`}
              />
            </div>
          )}

          {/* Size Grid */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-gray-900">
              Sizes <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {SIZES.map((size) => (
                <div
                  key={size}
                  className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-200"
                  data-testid={`size-row-${index}-${size}`}
                >
                  <span className="text-base font-medium text-gray-900 min-w-[50px]">{size}</span>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateSize(index, size, -1)}
                      disabled={item.sizes[size] === 0}
                      className="h-10 w-10 rounded-full border-gray-300"
                      data-testid={`size-decrement-${index}-${size}`}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-base font-semibold text-gray-900 min-w-[40px] text-center" data-testid={`size-qty-${index}-${size}`}>
                      {item.sizes[size]}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateSize(index, size, 1)}
                      disabled={item.sizes[size] === 999}
                      className="h-10 w-10 rounded-full border-gray-300"
                      data-testid={`size-increment-${index}-${size}`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item Total */}
          <div className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-xl">
            <span className="text-base font-medium">Item Total</span>
            <span className="text-xl font-bold" data-testid={`item-total-${index}`}>{getItemTotal(item)} pcs</span>
          </div>

          {/* Item Notes */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-900">Item Notes (optional)</Label>
            <Textarea
              value={item.notes}
              onChange={(e) => updateItem(index, 'notes', e.target.value)}
              placeholder="Special instructions for this item..."
              className="min-h-[80px] text-base rounded-xl resize-none"
              data-testid={`item-notes-${index}`}
            />
          </div>
        </div>
      ))}

      {/* Add Item Button */}
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="w-full h-12 text-base font-medium border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-900 hover:bg-gray-50"
        data-testid="add-item-button"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Another Product
      </Button>
    </div>
  );
};

export default ItemsStep;