

const { test, expect, chromium } = require('@playwright/test');

test('User appears in the list when joining the board', async () => {
  // Launch the browser in non-headless mode for visibility (can be headless for CI/CD)
  const browser = await chromium.launch({ headless: false });
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  await page1.goto('http://localhost:4200/whiteboard/user1');
  await page2.goto('http://localhost:4200/whiteboard/user2');

  await page2.waitForTimeout(5000); // Adjust timeout if necessary

  await page1.waitForSelector('#user-list');

  // Verify that user2's name appears in the user list
  const userListHTML = await page1.innerHTML('#user-list');
  expect(userListHTML).toContain('User2');

  await browser.close();
});

test('Pointer movement is visible to other users', async () => {
  // Launch the browser in non-headless mode for debugging (set to true for CI/CD)
  const browser = await chromium.launch({ headless: false });
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // User 1 joins the board
  await page1.goto('http://localhost:4200/whiteboard/user1');

  // User 2 joins the board
  await page2.goto('http://localhost:4200/whiteboard/user2');

  await page2.waitForTimeout(5000); 
  // Simulate User 1 moving the mouse
  await page1.mouse.move(100, 100);

  // Verify that User 1's pointer is visible on User 2's page
  const pointerElement = await page2.waitForSelector('#user1-pointer');
  const pointerPosition = await pointerElement.evaluate(el => {
    const style = getComputedStyle(el);
    return {
      top: parseInt(style.top),
      left: parseInt(style.left)
    };
  });

  expect(pointerPosition).toEqual({ top: 100, left: 100 });
  await browser.close();
});

test('Drag and drop <app-square> from sidebar to board', async () => {
  // Launch the browser in non-headless mode for visibility (can be headless for CI/CD)
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the application URL
  await page.goto('http://localhost:4200/whiteboard/user1');

  // Locate the <app-square> element in the sidebar
  const appSquare = await page.waitForSelector('app-square');

  // Locate the target .board element
  const board = await page.waitForSelector('.board');

  // Get the bounding box of the app-square to start the drag from its center
  const appSquareBox = await appSquare.boundingBox();

  // Get the bounding box of the board to ensure the drop position is relative to it
  const boardBox = await board.boundingBox();

  if (appSquareBox && boardBox) {
    // Calculate start coordinates for dragging (center of the <app-square>)
    const startX = appSquareBox.x + appSquareBox.width / 2;
    const startY = appSquareBox.y + appSquareBox.height / 2;

    // Calculate target coordinates relative to the board's bounding box
    const targetX = boardBox.x + 102; // 100px from the left of the board
    const targetY = boardBox.y + 102; // 100px from the top of the board

    // Simulate drag and drop
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY, { steps: 20 }); // Smooth move with 20 steps
    await page.mouse.up();

    
    // Verify that the <app-square> was moved to the correct position
    // Depending on your application, you might need to verify the exact element's position or another state change
    const droppedSquare = await page.$('#square-0');
    const droppedBox = await droppedSquare.boundingBox();


    // Check that the <app-square> is at the expected drop location
    expect(droppedBox.x).toBeCloseTo(targetX,1); 
    expect(droppedBox.y).toBeCloseTo(targetY,1);
  }
  await browser.close();

  // Keep the browser open for inspection if needed
  // Comment this out if you want to close the browser automatically
});
