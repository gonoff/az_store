# Online Store Pricing Integration Guide

This document explains how the AZTEAM ERP pricing system works and how to display prices correctly in your online store.

---

## Pricing Model Overview

The ERP uses a **Base Price + Adjustments** model:

```
Item Price = Base Price + Adjustments
```

Where:

- **Base Price** = Blank Cost + Default Front (Tiny) + Default Back (Medium)
- **Adjustments** = Price changes when customer modifies the default configuration

---

## Default Configuration

Every item starts with this assumed configuration:

| Component               | Size           | Price (DTF) | Price (Embroidery) |
| ----------------------- | -------------- | ----------- | ------------------ |
| Front                   | Tiny (5×5)     | $3.00       | $6.04              |
| Back                    | Medium (11×10) | $6.00       | $13.83             |
| **Customization Total** |                | **$9.00**   | **$19.87**         |

**Example Base Price Calculation:**

```
Gildan 5000 (Size L): $3.89 blank
+ Tiny Front:         $3.00
+ Medium Back:        $6.00
─────────────────────────────
Base Price:           $12.89
```

---

## Design Size Pricing (DTF)

| Size       | Dimensions | Price | Adjustment from Tiny  | Adjustment from Medium |
| ---------- | ---------- | ----- | --------------------- | ---------------------- |
| Teeny Tiny | 3.5×3.5    | $2.00 | −$1.00                | −$4.00                 |
| Tiny       | 5×5        | $3.00 | $0.00 (default front) | −$3.00                 |
| Small      | 5×11       | $4.00 | +$1.00                | −$2.00                 |
| Medium     | 11×10      | $6.00 | +$3.00                | $0.00 (default back)   |
| Large      | 14×14      | $8.00 | +$5.00                | +$2.00                 |

---

## How to Display Prices

### Product Listing Page

Show the **starting price** which is the base price for the cheapest blank size:

```html
<div class="product-card">
  <h3>Gildan 5000 T-Shirt</h3>
  <p class="price">Starting at $12.89</p>
  <p class="subtext">Includes front & back print</p>
</div>
```

### Product Detail Page

Show the base price with size selector that updates the price:

```html
<div class="product-detail">
  <h2>Gildan 5000 T-Shirt with DTF Print</h2>

  <div class="size-selector">
    <label>Garment Size:</label>
    <select id="garment-size">
      <option value="S" data-blank="3.89">Small - $12.89</option>
      <option value="M" data-blank="3.89">Medium - $12.89</option>
      <option value="L" data-blank="3.89">Large - $12.89</option>
      <option value="XL" data-blank="4.77">XL - $13.77</option>
      <option value="2XL" data-blank="6.99">2XL - $15.99</option>
    </select>
  </div>

  <div class="base-price">
    <strong>Base Price: $12.89</strong>
    <span class="includes">(Tiny front + Medium back included)</span>
  </div>
</div>
```

### Customization Options

When customer modifies design placements, show adjustments:

```html
<div class="customization-summary">
  <div class="base-price">
    <span>Base Price</span>
    <span>$12.89</span>
  </div>

  <div class="adjustments">
    <!-- Customer chose Teeny Tiny for front instead of Tiny -->
    <div class="adjustment discount">
      <span>↓ Front: Teeny Tiny</span>
      <span class="text-success">−$1.00</span>
    </div>

    <!-- Customer chose Large for back instead of Medium -->
    <div class="adjustment increase">
      <span>↑ Back: Large</span>
      <span class="text-danger">+$2.00</span>
    </div>

    <!-- Customer added a sleeve (not in default) -->
    <div class="adjustment increase">
      <span>↑ Left Sleeve: Teeny Tiny</span>
      <span class="text-danger">+$2.00</span>
    </div>
  </div>

  <div class="total">
    <strong>Item Total</strong>
    <strong>$15.89</strong>
  </div>
</div>
```

---

## API Integration

### Calculate Price Endpoint

```
POST /catalog/calculate-price
Content-Type: application/json
```

**Request:**

```json
{
  "product_id": 1,
  "size": "L",
  "method": "dtf",
  "quantity": 1,
  "designs": [
    { "area": "front", "design_size": "teeny_tiny" },
    { "area": "back", "design_size": "large" },
    { "area": "sleeve_left", "design_size": "teeny_tiny" }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "pricing": {
    "blank_cost": 3.89,
    "design_costs": [
      { "area": "front", "area_group": "main_body", "size": "teeny_tiny", "cost": 2.0 },
      { "area": "back", "area_group": "main_body", "size": "large", "cost": 8.0 },
      { "area": "sleeve_left", "area_group": "sleeve", "size": "teeny_tiny", "cost": 2.0 }
    ],
    "design_total": 12.0,
    "base_fee": 0.0,
    "base_price": {
      "blank_cost": 3.89,
      "default_front": 3.0,
      "default_back": 6.0,
      "total": 12.89
    },
    "adjustments": [
      { "area": "front", "size": "teeny_tiny", "adjustment": -1.0, "label": "Front: Teeny Tiny" },
      { "area": "back", "size": "large", "adjustment": 2.0, "label": "Back: Large" },
      {
        "area": "sleeve_left",
        "size": "teeny_tiny",
        "adjustment": 2.0,
        "label": "Left Sleeve: Teeny Tiny"
      }
    ],
    "per_item_price": 15.89,
    "quantity": 1,
    "total": 15.89
  }
}
```

---

## Adjustment Scenarios

### Scenario 1: Default Configuration (No Adjustments)

Customer selects Tiny front + Medium back:

```
Base Price: $12.89
Adjustments: None (default configuration)
Total: $12.89
```

### Scenario 2: Smaller Sizes (Discounts)

Customer selects Teeny Tiny front + Tiny back:

```
Base Price: $12.89
↓ Front: Teeny Tiny    −$1.00
↓ Back: Tiny           −$3.00
─────────────────────────────
Total: $8.89
```

### Scenario 3: Larger Sizes (Increases)

Customer selects Large front + Large back:

```
Base Price: $12.89
↑ Front: Large         +$5.00
↑ Back: Large          +$2.00
─────────────────────────────
Total: $19.89
```

### Scenario 4: Only Front (Back Removed)

Customer selects only Tiny front, no back:

```
Base Price: $12.89
↓ Back: None           −$6.00
─────────────────────────────
Total: $6.89
```

### Scenario 5: Only Back (Front Removed)

Customer selects only Medium back, no front:

```
Base Price: $12.89
↓ Front: None          −$3.00
─────────────────────────────
Total: $9.89
```

### Scenario 6: Additional Areas (Sleeves)

Customer adds sleeve to default:

```
Base Price: $12.89
↑ Left Sleeve: Teeny Tiny  +$2.00
─────────────────────────────────
Total: $14.89
```

---

## Display Guidelines

### Colors

- **Discounts**: Green text (`#28a745` or Bootstrap `text-success`)
- **Increases**: Red text (`#dc3545` or Bootstrap `text-danger`)
- **Base Price**: Bold, neutral color

### Icons

- **Discounts**: ↓ down arrow
- **Increases**: ↑ up arrow

### What NOT to Show

- ❌ Do NOT show blank cost separately (baked into base price)
- ❌ Do NOT show individual material costs
- ❌ Do NOT show labor/profit margins

### What to Show

- ✅ Base price (single number)
- ✅ Adjustments with clear labels
- ✅ Final total prominently

---

## Placement Areas

| Area Code      | Display Name | Area Group | Typical Sizes    |
| -------------- | ------------ | ---------- | ---------------- |
| `front`        | Front        | main_body  | Tiny → Large     |
| `back`         | Back         | main_body  | Tiny → Large     |
| `sleeve_left`  | Left Sleeve  | sleeve     | Teeny Tiny only  |
| `sleeve_right` | Right Sleeve | sleeve     | Teeny Tiny only  |
| `pocket`       | Pocket       | specialty  | Teeny Tiny, Tiny |
| `hat_front`    | Hat Front    | main_body  | Tiny → Medium    |
| `hat_side`     | Hat Side     | specialty  | Teeny Tiny only  |

---

## Quick Reference

### DTF Prices by Size

| Size                 | Price |
| -------------------- | ----- |
| Teeny Tiny (3.5×3.5) | $2.00 |
| Tiny (5×5)           | $3.00 |
| Small (5×11)         | $4.00 |
| Medium (11×10)       | $6.00 |
| Large (14×14)        | $8.00 |

### Default Configuration

- **Front**: Tiny ($3.00)
- **Back**: Medium ($6.00)
- **Customization Total**: $9.00

### Formula

```
Final Price = Blank Cost + $9.00 + Adjustments
```

---

## Questions?

Contact the development team or refer to the ERP documentation at `/documentation/features/` for more details.

---

_Last Updated: November 2024_
_Version: 1.0_
