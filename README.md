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

- Edit Store \*only auth Owner
- Delete Store \*only auth Owner

- See Categories
- See Store by Category (pagination)
- See Store (pagination)
- Search Store
- See Store

- Create Product
- Edit Product
- Delete Product

- Orders CRUD
- Orders Subscription :

  - Pending Orders (s: newOrder) (t: createOrder(newOrder))
  - Order Status (Customer, Delivery, Owner) (s: orderUpdate) (t: editOrder(orderUpdate))
  - Pending Pickup Order (Delivery) (s: orderUpdate) (t: editOrder(orderUpdate))

- Payments (CRON)

- Payment being verified

client: {
"x-jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiaWF0IjoxNjM5MzgzNzExfQ.PGqYeYKy_r2stB78lM_2cYfG5JgbbMWzGivN8hY0jPg"
}

owner: {
"x-jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWF0IjoxNjM5NjM4OTYwfQ.NGxP8YTNICSMd-E95kBWCa-EY_owj9sJK6We_p3m8ak"
}

driver: {
"x-jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiaWF0IjoxNjQ1NDMxOTgxfQ.IM5l-PRQcYMmq0rMUyocKJTMtpWtEFfN9SB9ECRUvvw"
}
