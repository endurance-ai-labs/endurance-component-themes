import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertProductionAuth,
  allowedDomainForEnv,
  devLoginEmail,
  devLoginEnabled,
  devLoginName,
  isAllowedEmailForEnv,
  isVercelPreview,
  isVercelProduction,
  type AuthEnv,
} from "./runtime";

const local: AuthEnv = {
  NODE_ENV: "development",
  SESSION_SECRET: "local-secret",
  ALLOWED_EMAIL_DOMAIN: "endurancelabs.ai",
  DEV_LOGIN_EMAIL: "alex@endurancelabs.ai",
};

describe("isVercelProduction", () => {
  it("is only VERCEL_ENV=production, not NODE_ENV", () => {
    assert.equal(isVercelProduction({ VERCEL_ENV: "production", NODE_ENV: "production" }), true);
    assert.equal(isVercelProduction({ VERCEL_ENV: "preview", NODE_ENV: "production" }), false);
    assert.equal(isVercelProduction({ NODE_ENV: "production" }), false);
    assert.equal(isVercelProduction({ NODE_ENV: "development" }), false);
  });
});

describe("isVercelPreview", () => {
  it("is only VERCEL_ENV=preview", () => {
    assert.equal(isVercelPreview({ VERCEL_ENV: "preview" }), true);
    assert.equal(isVercelPreview({ VERCEL_ENV: "production" }), false);
    assert.equal(isVercelPreview({}), false);
  });
});

describe("assertProductionAuth", () => {
  it("is a no-op off production", () => {
    assert.doesNotThrow(() => assertProductionAuth({ NODE_ENV: "development" }));
    assert.doesNotThrow(() =>
      assertProductionAuth({ VERCEL_ENV: "preview", NODE_ENV: "production" }),
    );
  });

  it("fails closed when SESSION_SECRET is missing in production", () => {
    assert.throws(
      () =>
        assertProductionAuth({
          VERCEL_ENV: "production",
          ALLOWED_EMAIL_DOMAIN: "endurancelabs.ai",
        }),
      /SESSION_SECRET/,
    );
    assert.throws(
      () =>
        assertProductionAuth({
          VERCEL_ENV: "production",
          SESSION_SECRET: "   ",
          ALLOWED_EMAIL_DOMAIN: "endurancelabs.ai",
        }),
      /SESSION_SECRET/,
    );
  });

  it("fails closed when ALLOWED_EMAIL_DOMAIN is missing in production", () => {
    assert.throws(
      () =>
        assertProductionAuth({
          VERCEL_ENV: "production",
          SESSION_SECRET: "secret",
        }),
      /ALLOWED_EMAIL_DOMAIN/,
    );
  });

  it("passes when both are set in production", () => {
    assert.doesNotThrow(() =>
      assertProductionAuth({
        VERCEL_ENV: "production",
        SESSION_SECRET: "secret",
        ALLOWED_EMAIL_DOMAIN: "endurancelabs.ai",
      }),
    );
  });
});

describe("devLoginEnabled", () => {
  it("is on for local next dev when the email is on the domain", () => {
    assert.equal(devLoginEnabled(local), true);
    assert.equal(devLoginEmail(local), "alex@endurancelabs.ai");
  });

  it("is on for Vercel preview (NODE_ENV is production there)", () => {
    assert.equal(
      devLoginEnabled({
        ...local,
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
      }),
      true,
    );
  });

  it("is off on Vercel production even if DEV_LOGIN_EMAIL is set", () => {
    assert.equal(
      devLoginEnabled({
        ...local,
        NODE_ENV: "production",
        VERCEL_ENV: "production",
      }),
      false,
    );
    assert.equal(
      devLoginEmail({
        ...local,
        NODE_ENV: "production",
        VERCEL_ENV: "production",
      }),
      null,
    );
  });

  it("is off for a local next start (production-mode, no Vercel env)", () => {
    assert.equal(devLoginEnabled({ ...local, NODE_ENV: "production" }), false);
  });

  it("is off when the email is unset", () => {
    assert.equal(devLoginEnabled({ ...local, DEV_LOGIN_EMAIL: undefined }), false);
    assert.equal(devLoginEnabled({ ...local, DEV_LOGIN_EMAIL: "  " }), false);
  });

  it("is off when the email is off-domain", () => {
    assert.equal(devLoginEnabled({ ...local, DEV_LOGIN_EMAIL: "alex@gmail.com" }), false);
  });
});

describe("allowedDomainForEnv", () => {
  it("defaults locally when unset", () => {
    assert.equal(allowedDomainForEnv({ NODE_ENV: "development" }), "endurancelabs.ai");
  });

  it("throws in production when unset", () => {
    assert.throws(() => allowedDomainForEnv({ VERCEL_ENV: "production" }), /ALLOWED_EMAIL_DOMAIN/);
  });

  it("uses the configured domain", () => {
    assert.equal(
      allowedDomainForEnv({ ALLOWED_EMAIL_DOMAIN: "rjslogistics.com" }),
      "rjslogistics.com",
    );
  });
});

describe("isAllowedEmailForEnv", () => {
  it("is the domain check, case-insensitive", () => {
    assert.equal(isAllowedEmailForEnv("Alex@EnduranceLabs.ai", local), true);
    assert.equal(isAllowedEmailForEnv("alex@other.ai", local), false);
  });
});

describe("devLoginName", () => {
  it("uses DEV_LOGIN_NAME when set", () => {
    assert.equal(devLoginName({ ...local, DEV_LOGIN_NAME: "Alex Sok" }), "Alex Sok");
  });

  it("derives a name from the email local-part otherwise", () => {
    assert.equal(devLoginName(local), "Alex");
  });
});
