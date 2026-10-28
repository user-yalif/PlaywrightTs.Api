import {test, expect} from '@playwright/test'

test('Delete Article', async ({ page, request }) => {
    const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
            "user": {
                "email": "test.userA@test.com",
                "password": "test1234"
            }
        }
    })

    expect(loginResponse.status()).toEqual(200);
    const loginResponseJson = await loginResponse.json();
    const token = loginResponseJson.user.token;
    console.log(token);

    const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            "article": {
                "title": "Test Article 3",
                "description": "Test Article 3 Description",
                "body": "Test Article 3 Body\naafadsfasd sdafdfasdfdsf dfadfads\nafdasdfasdf \nafdsadfadsfadsfasdf",
                "tagList": []
            }
        }
    });

    expect(newArticleResponse.status()).toEqual(201);

    await page.goto('https://conduit.bondaracademy.com/');
    await page.getByText('Sign in').click();
    await page.getByRole('textbox', { name: 'Email' }).fill('test.userA@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('test1234');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await (expect(page.locator('.preview-link h1').first()).toContainText('Test Article 3'));
    await page.getByText('Test Article 3').first().click();
    await page.getByRole('button', { name: 'Delete Article' }).first().click();

    await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0');
    await expect(page.locator('.preview-link h1').first()).not.toContainText('Test Article 3');
});