# Merchant Dashboard

Dashboard dành cho Merchant (chủ nhà hàng) quản lý nhà hàng của mình.

## Cấu trúc

```
app/merchant/
├── layout.tsx                 # Layout chính với sidebar
├── page.tsx                   # Dashboard tổng quan
├── orders/
│   └── page.tsx              # Quản lý đơn hàng
├── reservations/
│   └── page.tsx              # Quản lý đặt bàn
├── customers/
│   └── page.tsx              # Quản lý khách hàng
├── restaurants/
│   ├── page.tsx              # Danh sách nhà hàng
│   └── create/
│       └── page.tsx          # Tạo nhà hàng mới
├── menu/
│   └── page.tsx              # Quản lý menu
└── manage/
    ├── staff/
    │   └── page.tsx          # Quản lý nhân viên
    └── settings/
        └── page.tsx          # Cài đặt
```

## Tính năng

- ✅ Dashboard với thống kê tổng quan
- ✅ Quản lý đơn hàng
- ✅ Quản lý đặt bàn
- ✅ Quản lý khách hàng
- ✅ Quản lý nhà hàng
- ✅ Quản lý menu
- ✅ Quản lý nhân viên
- ✅ Cài đặt
- ✅ Dark mode
- ✅ Responsive design

## Routes

- `/merchant` - Dashboard
- `/merchant/orders` - Orders
- `/merchant/reservations` - Reservations
- `/merchant/customers` - Customers
- `/merchant/restaurants` - Restaurants list
- `/merchant/restaurants/create` - Create new restaurant
- `/merchant/menu` - Menu management
- `/merchant/manage/staff` - Staff management
- `/merchant/manage/settings` - Settings

## TODO

- [ ] Kết nối API thật
- [ ] Thêm tính năng tìm kiếm và lọc
- [ ] Thêm pagination
- [ ] Thêm form validation
- [ ] Thêm chức năng upload ảnh
- [ ] Thêm analytics và reports
