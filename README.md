# BackShuttle

The Backend of BackShuttle

## User Entity:

- id
- createdAt
- updatedAt

- email
- password
- role(client|owner|delivery)

## User CRUD:

- Create Account
- Log In
- See Profile
- Edit Profile
- Verify Email

## Store Model

- name
- category
- address
- coverImage

## Manage Store

- Edit Store *only auth Owner
- Delete Store *only auth Owner

- See Categories
- See Store by Category (pagination)
- See Store (pagination)
- Search Store
- See Store

- Create Product
- Edit Product
- Delete Product

- Orders CRUD
- Orders Subscription (Owner, Customer, Delivery)
- Payments (CRON)