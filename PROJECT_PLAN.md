# MilkLedger - Project Plan

## Customer Module

### Customer Fields

- Name
- Mobile
- Village
- Rate
- Collection Order

---

## Collection Order Rules

### Rule 1

Collection Order must always be continuous.

Correct

1
2
3
4
5

Wrong

1
2
5
7

---

### Rule 2

If Collection Number is empty

→ Save customer normally.

---

### Rule 3

If Collection Number already exists

Show

Collection Number already exists.

Options

- Insert Here
- Change Number
- Cancel

---

### Rule 4

Insert Here

Shift all customers from that position by +1.

Example

Before

1 Rahul
2 Amit
3 Sunil

After

1 Rahul
2 New Customer
3 Amit
4 Sunil

---

### Rule 5

Delete Customer

Shift all customers after that position by -1.

Example

Before

1 Rahul
2 Amit
3 Sunil

Delete Amit

After

1 Rahul
2 Sunil

---

### Rule 6

Milk Collection

Morning

Customer 1

↓

Save & Next

↓

Customer 2

↓

Save & Next

↓

Customer 3

No searching.

No customer list.

---

## Future Modules

- Billing
- Reports
- Payments
- PDF
- WhatsApp