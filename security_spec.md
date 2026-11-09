# Security Specification & Threat Model: Salim Fragrance

## 1. Data Invariants
1. A fragrance document in `/fragrances/{fragranceId}` must have valid identifier characters (`[a-zA-Z0-9_-]+`), maximum 128 characters.
2. Required fields must always be present: `id`, `name`, `category`, `priceMad`, `image`.
3. The `name` must be a non-empty string and under 150 characters.
4. The `category` must strictly belong to `['For Him', 'For Her', 'Unisex']`.
5. The `priceMad` must be a positive finite number >= 0.
6. The `decant10PriceMad` when provided must be a positive finite number.
7. Any visitor can read the catalogue (`allow read: if true;`) so all shoppers, links, and devices can browse products without authentication.
8. Writes (create, update, delete) must conform strictly to schema shape and size limits to prevent database poisoning or malformed data injection.

## 2. The Dirty Dozen Payloads (Targeting `/fragrances/{fragranceId}`)
1. Missing `name`: `{ id: 'frag-1', category: 'Unisex', priceMad: 500 }` -> REJECT
2. Negative `priceMad`: `{ id: 'frag-1', name: 'Oud', category: 'Unisex', priceMad: -100 }` -> REJECT
3. Huge string ID (> 128 chars): `id` with 2000 chars -> REJECT
4. Malformed category: `{ id: 'frag-1', name: 'Oud', category: 'HackedCategory', priceMad: 450 }` -> REJECT
5. Missing `id`: `{ name: 'Oud', category: 'Unisex', priceMad: 450 }` -> REJECT
6. String price: `{ id: 'frag-1', name: 'Oud', category: 'Unisex', priceMad: 'free' }` -> REJECT
7. Overflowing name (> 150 chars) -> REJECT
8. Huge malformed JSON payload with unwhitelisted keys -> REJECT
9. Ghost field injection (e.g. `{ isSuperAdmin: true }`) -> REJECT
10. Unbounded recursive object structures -> REJECT
11. Malformed decant price (negative or non-numeric) -> REJECT
12. Attempt to write to arbitrary root collection (e.g. `/system_configs/vault`) -> REJECT (Global default deny)
