import { expect, test } from "@playwright/test";

test("l’accueil présente le jeu disponible et les futurs jeux", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Parle. Bluffe. Buzze." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "OBJECTIF SECRET" })).toBeVisible();
  await expect(page.getByText("RÈGLE CACHÉE")).toBeVisible();
  await expect(page.getByText("Bot Discord disponible")).toBeVisible();
});

test("le mode démo crée un lobby puis lance le plateau", async ({ page }) => {
  await page.goto("/lobbies/create");
  await page.getByLabel("Nom du lobby").fill("Test des amis");
  await page.getByRole("button", { name: "Créer le lobby" }).click();
  await expect(page).toHaveURL(/\/lobby\/DEMO1/);
  await page.getByRole("button", { name: "Simuler tout le monde prêt" }).click();
  await page.getByRole("button", { name: "Lancer la partie" }).click();
  await expect(page).toHaveURL(/\/play\/demo-match/);
  await expect(page.getByText("TON OBJECTIF")).toBeVisible();
});

test("le buzzer ouvre une accusation", async ({ page }) => {
  await page.goto("/play/demo-match");
  await page.getByTestId("buzzer").click();
  await expect(page.getByRole("heading", { name: "Qui accuses-tu ?" })).toBeVisible();
});

test("le plateau reste utilisable sur mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Vérification réservée au profil mobile");
  await page.goto("/play/demo-match");
  await expect(page.getByTestId("buzzer")).toBeVisible();
  await expect(page.getByRole("button", { name: /Objectif accompli/ })).toBeVisible();
});
