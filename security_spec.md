# Security Specification: Blog Feature & Firestore Rules

## Data Invariants
1. **Ownership & Identity**: A blog post must have an `authorId` strictly matching `request.auth.uid`. A user cannot forge another user's `authorId`.
2. **Multi-Tenancy**: Every post contains a `tenantId` string (defaulting to 'default' or a specified tenant). A post cannot have its `tenantId` or `authorId` or `createdAt` altered during an update.
3. **Visibility & Privacy**:
   - Anyone (authenticated or guest) can read (`get` and `list`) posts where `status == 'public'`.
   - Only the author can read (`get` and `list`) private posts (`status == 'private'`).
   - Only the author can update or delete their own posts.
4. **Boundary Limits**:
   - `title`: string <= 300 chars
   - `description`: string <= 1000 chars
   - `content`: string <= 50000 chars
   - `imageUrl`: string <= 2048 chars
   - `status`: string ('public' or 'private')
   - `sourceLinks`: list <= 10 items
   - `socialLinks`: list <= 10 items
   - `tenantId`: string <= 64 chars

## The "Dirty Dozen" Threat Payloads (Targeting Rejection)
1. **Unauthenticated Write**: Creating a post without signing in -> `PERMISSION_DENIED`.
2. **Author Spoofing**: Signed-in user 'userA' attempting `authorId: 'userB'` -> `PERMISSION_DENIED`.
3. **Ghost Field Injection**: Adding undeclared field `isAdmin: true` or `verified: true` -> `PERMISSION_DENIED`.
4. **Oversized Content DOS**: Post content exceeding 50,000 characters -> `PERMISSION_DENIED`.
5. **Invalid Status Bypass**: Setting `status: 'published_secret'` -> `PERMISSION_DENIED`.
6. **Immutable Key Mutation (authorId)**: User updating post to reassign `authorId` -> `PERMISSION_DENIED`.
7. **Immutable Key Mutation (createdAt)**: User modifying the creation date -> `PERMISSION_DENIED`.
8. **Malicious ID Poisoning**: Document ID with directory traversal or invalid characters -> `PERMISSION_DENIED`.
9. **Private Post Query Scraping**: Non-author querying `status == 'private'` posts -> `PERMISSION_DENIED`.
10. **Non-Author Update**: User 'userB' attempting to update 'userA' post -> `PERMISSION_DENIED`.
11. **Non-Author Delete**: User 'userB' attempting to delete 'userA' post -> `PERMISSION_DENIED`.
12. **Array Expansion Attack**: Submitting 500 source links -> `PERMISSION_DENIED`.
