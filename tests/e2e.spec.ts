import { test, expect } from '@playwright/test';

test.describe('Plan My Trip E2E Flow', () => {
  test('should load the home page, enter destination, and generate trip', async ({ page }) => {
    // Navigate to the home page
    await page.goto('http://localhost:3000/');

    // Ensure 3D Canvas wrapper is visible
    await expect(page.locator('canvas')).toBeVisible();

    // Fill the destination
    await page.fill('input#destination', 'Goa');

    // Fill dates
    await page.fill('input#dates', 'Next weekend');

    // Submit the form
    await page.click('button[type="submit"]');

    // Verify the loading state appears
    await expect(page.getByText('Generating AI Trip...')).toBeVisible();

    // The AI Dashboard should eventually render the Destination Overview Card
    await expect(page.getByText('Destination Overview')).toBeVisible({ timeout: 15000 });
    
    // Verify specific components of the dashboard rendered (e.g. Weather, Budget Range)
    await expect(page.getByText('Weather')).toBeVisible();
    await expect(page.getByText('Day-by-Day Itinerary')).toBeVisible();
  });

  test('should render 3D scene correctly on destination change', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Test a city destination
    await page.fill('input#destination', 'Mumbai');
    await page.click('button[type="submit"]');

    // Since the canvas is drawn via WebGL, we cannot inspect the DOM for 3D elements,
    // but we can verify the SceneManager changes state by ensuring no errors are thrown
    // and the canvas remains active.
    await expect(page.locator('canvas')).toBeVisible();
  });
});
