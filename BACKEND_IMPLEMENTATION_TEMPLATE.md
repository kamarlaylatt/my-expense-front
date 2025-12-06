# Backend Implementation Template

This file provides a template for implementing Google OAuth on your Node.js backend.

## Database Schema Update

```sql
-- Add OAuth fields to users table
ALTER TABLE users ADD COLUMN provider VARCHAR(50);
ALTER TABLE users ADD COLUMN providerAccountId VARCHAR(255);
ALTER TABLE users ADD COLUMN emailVerified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN image TEXT;

-- Create unique index for OAuth account linking
CREATE UNIQUE INDEX idx_provider_account ON users(provider, providerAccountId);
```

## Express.js Implementation Example

```javascript
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

// POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { email, name, providerAccountId, provider, image } = req.body;

    // Validate required fields
    if (!email || !providerAccountId || !provider) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, providerAccountId, provider",
      });
    }

    // Check if user exists by providerAccountId
    let user = await User.findOne({
      where: { providerAccountId, provider },
    });

    if (user) {
      // User already registered with this provider
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      return res.status(200).json({
        success: true,
        message: "Google authentication successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            provider: user.provider,
            providerAccountId: user.providerAccountId,
            image: user.image,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        },
      });
    }

    // Check if user exists by email (link to existing account)
    user = await User.findOne({ where: { email } });

    if (user) {
      // Update existing user with Google provider
      await user.update({
        provider,
        providerAccountId,
        emailVerified: true, // Google verified the email
        image: image || user.image,
      });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      return res.status(200).json({
        success: true,
        message: "Google authentication successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            provider: user.provider,
            providerAccountId: user.providerAccountId,
            image: user.image,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        },
      });
    }

    // Create new user
    user = await User.create({
      email,
      name: name || email.split("@")[0], // Default name if not provided
      provider,
      providerAccountId,
      emailVerified: true, // Google verified the email
      image,
      password: null, // No password for OAuth users
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      success: true,
      message: "User created and authenticated successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          provider: user.provider,
          providerAccountId: user.providerAccountId,
          image: user.image,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
```

## Prisma.js Implementation Example

```typescript
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import express from "express";

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";

// POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { email, name, providerAccountId, provider, image } = req.body;

    // Validate required fields
    if (!email || !providerAccountId || !provider) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, providerAccountId, provider",
      });
    }

    // Check if user exists by providerAccountId
    let user = await prisma.user.findFirst({
      where: {
        providerAccountId,
        provider,
      },
    });

    if (user) {
      // Generate token and return
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      return res.status(200).json({
        success: true,
        message: "Google authentication successful",
        data: { user, token },
      });
    }

    // Check if user exists by email
    user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Update user with Google provider
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider,
          providerAccountId,
          emailVerified: true,
          image: image || user.image,
        },
      });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      return res.status(200).json({
        success: true,
        message: "Google authentication successful",
        data: { user, token },
      });
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        provider,
        providerAccountId,
        emailVerified: true,
        image,
        password: null,
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      success: true,
      message: "User created and authenticated successfully",
      data: { user, token },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
```

## TypeORM Implementation Example

```typescript
import { Router } from "express";
import { getRepository } from "typeorm";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";

// POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { email, name, providerAccountId, provider, image } = req.body;

    if (!email || !providerAccountId || !provider) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const userRepository = getRepository(User);

    // Find by provider account
    let user = await userRepository.findOne({
      where: { providerAccountId, provider },
    });

    if (!user) {
      // Find by email
      user = await userRepository.findOne({ where: { email } });

      if (user) {
        // Link provider to existing account
        user.provider = provider;
        user.providerAccountId = providerAccountId;
        user.emailVerified = true;
        if (image) user.image = image;
        await userRepository.save(user);
      } else {
        // Create new user
        user = userRepository.create({
          email,
          name: name || email.split("@")[0],
          provider,
          providerAccountId,
          emailVerified: true,
          image,
          password: null,
        });
        await userRepository.save(user);
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(user.createdAt ? 200 : 201).json({
      success: true,
      message: "Google authentication successful",
      data: { user, token },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
```

## Key Implementation Points

1. **Validation**: Always validate email, providerAccountId, and provider
2. **Account Linking**: Check existing email before creating new user
3. **Token Generation**: Use same JWT configuration as your other auth endpoints
4. **Email Verification**: Set emailVerified = true for Google users
5. **Password**: Set password = null for OAuth-only users
6. **Image**: Optionally store Google's profile picture URL

## Response Format

Ensure all responses match your API documentation format:

```json
{
  "success": boolean,
  "message": string,
  "data": {
    "user": { /* User object */ },
    "token": "jwt-token"
  },
  "errors": [ /* validation errors if any */ ]
}
```

## Testing

You can test the endpoint with cURL:

```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "name": "Test User",
    "providerAccountId": "118364933200870915143",
    "provider": "google"
  }'
```

Or use Postman/Insomnia to test the endpoint.
