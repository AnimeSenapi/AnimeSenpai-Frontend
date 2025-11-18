import 'cypress-axe'

Cypress.Commands.add('injectAndCheckA11y', (context = 'main', options = {}) => {
  cy.injectAxe()
  cy.checkA11y(context, {
    runOnly: ['wcag2a', 'wcag2aa'],
    rules: {
      'color-contrast': { enabled: true },
    },
    ...options,
  })
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      injectAndCheckA11y(context?: string | Element, options?: unknown): Chainable<void>
    }
  }
}


