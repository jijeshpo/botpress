import expectp from 'expect-puppeteer'

import { clickOn } from '../expectPuppeteer'
import { autoAnswerDialog, expectBotApiCallSuccess, gotoStudio, waitForBotApiResponse } from '../utils'

const getElementCount = async (): Promise<number> => {
  return (await page.$$('.icon-edit')).length
}

describe('Studio - CMS', () => {
  beforeAll(async () => {
    if (!page.url().includes('studio')) {
      await gotoStudio()
    }
  })

  it('Load CMS', async () => {
    await clickOn('#bp-menu_Content')
    await expectBotApiCallSuccess(`content/elements`, 'POST')
  })

  it('Filter text elements', async () => {
    await page.waitForFunction(`document.querySelectorAll(".icon-edit").length > 0`)
    const before = await getElementCount()

    await clickOn('#btn-filter-builtin_text')
    await expectBotApiCallSuccess(`content/builtin_text/elements`, 'POST')
    const after = await getElementCount()
    await expect(after).toBeLessThan(before)
  })

  it('Create text element', async () => {
    const before = await getElementCount()
    await clickOn('#btn-add-content')
    await clickOn('#btn-create-builtin_text')

    await page.keyboard.press('Tab')
    await page.keyboard.type('hey!')
    await clickOn('button[type="submit"]')

    await expectBotApiCallSuccess('content/builtin_text/element', 'POST')
    await page.waitFor(500) // Ensure the element is created and the list is reloaded
    const after = await getElementCount()

    expect(after).toBe(before + 1)
  })

  it('Search element', async () => {
    await page.waitFor(1000)
    await expectp(page).toFill('#input-search', 'hey')

    const response = await waitForBotApiResponse('content/builtin_text/elements')
    expect(response.length).toBe(1)
  })

  it('Delete element', async () => {
    autoAnswerDialog()
    await clickOn(`[id^='chk-builtin_text']`)
    await clickOn(`#btn-delete`)
    await expectBotApiCallSuccess('content/elements/bulk_delete', 'POST')
  })
})