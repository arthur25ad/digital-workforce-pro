import { describe, it, expect } from "vitest";
import { getTopNavLinks, getFooterGroups } from "@/config/siteNav";
import { ROLES, getRoleBySlug, ALL_ROLE_SLUGS } from "@/config/roles";
import { INTEGRATIONS, getLiveIntegrations } from "@/config/integrations";

describe("siteNav config", () => {
  it("returns top nav links", () => {
    const links = getTopNavLinks();
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((l) => l.href.startsWith("/"))).toBe(true);
  });

  it("returns footer groups with correct structure", () => {
    const groups = getFooterGroups();
    expect(groups).toHaveLength(3);
    expect(groups.map((g) => g.title)).toEqual(["Product", "Explore", "Company"]);
    groups.forEach((g) => expect(g.links.length).toBeGreaterThan(0));
  });
});

describe("roles config", () => {
  it("has 4 roles", () => {
    expect(ROLES).toHaveLength(4);
  });

  it("getRoleBySlug returns correct role", () => {
    const role = getRoleBySlug("calendar-assistant");
    expect(role).toBeDefined();
    expect(role?.fullLabel).toBe("AI Calendar Assistant");
  });

  it("ALL_ROLE_SLUGS matches ROLES", () => {
    expect(ALL_ROLE_SLUGS).toEqual(ROLES.map((r) => r.slug));
  });
});

describe("integrations config", () => {
  it("has integrations defined", () => {
    expect(INTEGRATIONS.length).toBeGreaterThan(0);
  });

  it("getLiveIntegrations returns only live ones", () => {
    const live = getLiveIntegrations();
    live.forEach((i) => expect(i.status).toBe("live"));
  });

  it("every integration has required fields", () => {
    INTEGRATIONS.forEach((i) => {
      expect(i.name).toBeTruthy();
      expect(i.slug).toBeTruthy();
      expect(i.status).toBeTruthy();
      expect(i.description).toBeTruthy();
    });
  });
});
